// src/routes/spots/[id]/+page.server.js
// ERGÄNZE die bestehende Datei um die deleteSpot Action am Ende.
// Die load-Funktion (getSpot + getReviews) bleibt unverändert.

import { fail, redirect, error } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import { ADMIN_EMAIL } from '$env/static/private';

// --- Deine bestehende load-Funktion bleibt hier ---
export async function load({ params, locals }) {
  const db = await getDb();

  const spot = await db.collection('spots').findOne({ _id: new ObjectId(params.id) });
  if (!spot) error(404, 'Spot nicht gefunden');

  const reviews = await db
    .collection('reviews')
    .find({ spotId: new ObjectId(params.id) })
    .sort({ erstelltAm: -1 })
    .toArray();

  // Durchschnittsbewertung berechnen
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.sterne, 0) / reviews.length) * 10) / 10
      : null;

  return {
    spot: { ...spot, _id: spot._id.toString() },
    reviews: reviews.map((r) => ({ ...r, _id: r._id.toString(), spotId: r.spotId.toString() })),
    avgRating,
    user: locals.user,
    isAdmin: locals.user?.email === ADMIN_EMAIL
  };
}

// --- Review abgeben (bestehende Action, falls vorhanden) ---
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
      autorName: locals.user.email.split('@')[0], // z.B. "vorname.nachname"
      autorEmail: locals.user.email,
      sterne,
      kommentar: kommentar || '',
      erstelltAm: new Date()
    });

    return { success: true };
  },

  // --- NUR ADMIN: Spot löschen ---
  deleteSpot: async ({ params, locals }) => {
    // Doppelte Absicherung: kein Login → 401
    if (!locals.user) {
      return fail(401, { error: 'Nicht autorisiert.' });
    }

    // Kein Admin → 403
    if (locals.user.email !== ADMIN_EMAIL) {
      return fail(403, { error: 'Nur Admins dürfen Spots löschen.' });
    }

    const db = await getDb();
    await db.collection('spots').deleteOne({ _id: new ObjectId(params.id) });
    // Zugehörige Reviews ebenfalls löschen
    await db.collection('reviews').deleteMany({ spotId: new ObjectId(params.id) });

    redirect(303, '/spots');
  }
};
