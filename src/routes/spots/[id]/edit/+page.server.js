import { fail, redirect, error } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import { ADMIN_EMAIL } from '$env/static/private';

export async function load({ params, locals }) {
  if (!locals.user || locals.user.email !== ADMIN_EMAIL) {
    redirect(303, `/spots/${params.id}`);
  }

  const db = await getDb();
  const spot = await db.collection('spots').findOne({ _id: new ObjectId(params.id) });
  if (!spot) error(404, 'Spot nicht gefunden');

  return { spot: { ...spot, _id: spot._id.toString() } };
}

export const actions = {
  updateSpot: async ({ request, params, locals }) => {
    if (!locals.user || locals.user.email !== ADMIN_EMAIL) {
      return fail(403, { error: 'Nicht autorisiert.' });
    }

    const data = await request.formData();

    const strasse = data.get('strasse')?.toString().trim() ?? '';
    const plz = data.get('plz')?.toString().trim() ?? '';
    const ort = data.get('ort')?.toString().trim() ?? '';

    const lat = parseFloat(data.get('lat') ?? '');
    const lng = parseFloat(data.get('lng') ?? '');

    const update = {
      name: data.get('name')?.toString().trim(),
      strasse,
      plz,
      ort,
      adresse: `${strasse}, ${plz} ${ort}`,
      beschreibung: data.get('beschreibung')?.toString().trim() || '',
      laerm: data.get('laerm')?.toString() || 'ruhig',
      bildUrl: data.get('bildUrl')?.toString().trim() || '',
      websiteUrl: data.get('websiteUrl')?.toString().trim() || '',
      wlan: data.get('wlan') === 'on',
      steckdosen: data.get('steckdosen') === 'on',
      ...(lat && lng ? { lat, lng } : {})
    };

    if (!update.name || !update.strasse || !update.plz || !update.ort) {
      return fail(400, { error: 'Bitte alle Pflichtfelder ausfüllen.', ...update });
    }

    const db = await getDb();
    await db.collection('spots').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: update }
    );

    redirect(303, `/spots/${params.id}`);
  }
};
