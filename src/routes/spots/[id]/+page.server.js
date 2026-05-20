import { fail, redirect, error } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import { ADMIN_EMAIL } from '$env/static/private';

const STATUS_WERT = { ruhig: 1, mittel: 2, voll: 3 };

function wertZuStatus(wert) {
  if (wert <= 1.5) return 'ruhig';
  if (wert <= 2.5) return 'mittel';
  return 'voll';
}

export async function load({ params, locals }) {
  const db = await getDb();

  const spot = await db.collection('spots').findOne({ _id: new ObjectId(params.id) });
  if (!spot) error(404, 'Spot nicht gefunden');

  const reviews = await db
    .collection('reviews')
    .find({ spotId: new ObjectId(params.id) })
    .sort({ erstelltAm: -1 })
    .toArray();

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.sterne, 0) / reviews.length) * 10) / 10
      : null;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const checkins = await db
    .collection('checkins')
    .find({ spotId: new ObjectId(params.id), erstelltAm: { $gte: twoHoursAgo } })
    .toArray();

  let currentStatus = null;
  if (checkins.length > 0) {
    const summe = checkins.reduce((acc, c) => acc + (STATUS_WERT[c.status] ?? 2), 0);
    currentStatus = {
      status: wertZuStatus(summe / checkins.length),
      count: checkins.length
    };
  }

  return {
    spot: { ...spot, _id: spot._id.toString() },
    reviews: reviews.map((r) => ({ ...r, _id: r._id.toString(), spotId: r.spotId.toString() })),
    avgRating,
    user: locals.user,
    isAdmin: locals.user?.email === ADMIN_EMAIL,
    currentStatus
  };
}

export const actions = {
  addReview: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Du musst eingeloggt sein, um eine Bewertung abzugeben.' });
    }

    const data = await request.formData();
    const sterne = parseInt(data.get('sterne'));
    const kommentar = data.get('kommentar')?.toString().trim();

    if (!sterne || sterne < 1 || sterne > 5) {
      return fail(400, { error: 'Bitte eine Bewertung zwischen 1 und 5 Sternen wählen.' });
    }

    const db = await getDb();
    await db.collection('reviews').insertOne({
      spotId: new ObjectId(params.id),
      autorName: locals.user.email.split('@')[0],
      autorEmail: locals.user.email,
      sterne,
      kommentar: kommentar || '',
      erstelltAm: new Date()
    });

    return { success: true };
  },

  setStatus: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Einloggen erforderlich.' });
    }

    const data = await request.formData();
    const status = data.get('status')?.toString();

    if (!['ruhig', 'mittel', 'voll'].includes(status)) {
      return fail(400, { error: 'Ungültiger Status.' });
    }

    const isAdmin = locals.user.email === ADMIN_EMAIL;
    const db = await getDb();

    if (!isAdmin) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentCheckin = await db.collection('checkins').findOne({
        spotId: new ObjectId(params.id),
        userId: locals.user.id,
        erstelltAm: { $gte: fifteenMinutesAgo }
      });

      if (recentCheckin) {
        return fail(429, {
          rateLimitError: 'Du hast bereits einen Status gemeldet. Warte 15 Minuten.'
        });
      }
    }

    await db.collection('checkins').insertOne({
      spotId: new ObjectId(params.id),
      userId: locals.user.id,
      status,
      erstelltAm: new Date()
    });

    return { statusSuccess: true };
  },

  deleteSpot: async ({ params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Nicht autorisiert.' });
    }
    if (locals.user.email !== ADMIN_EMAIL) {
      return fail(403, { error: 'Nur Admins dürfen Spots löschen.' });
    }

    const db = await getDb();
    await db.collection('spots').deleteOne({ _id: new ObjectId(params.id) });
    await db.collection('reviews').deleteMany({ spotId: new ObjectId(params.id) });
    await db.collection('checkins').deleteMany({ spotId: new ObjectId(params.id) });

    redirect(303, '/spots');
  }
};
