// src/routes/spots/create/+page.server.js
// ERGÄNZE am Anfang der bestehenden Datei die Auth-Guard-Logik.
// Der Rest (createSpot Action) bleibt unverändert.

import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';

export async function load({ locals }) {
  // AUTH GUARD: Nicht eingeloggt → zum Login
  if (!locals.user) {
    redirect(303, '/login');
  }
  return {};
}

export const actions = {
  createSpot: async ({ request, locals }) => {
    // Nochmals prüfen (Server-Side, sicher)
    if (!locals.user) {
      return fail(401, { error: 'Du musst eingeloggt sein, um einen Spot hinzuzufügen.' });
    }

    const data = await request.formData();

    const spot = {
      name: data.get('name')?.toString().trim(),
      strasse: data.get('strasse')?.toString().trim(),
      plz: data.get('plz')?.toString().trim(),
      ort: data.get('ort')?.toString().trim(),
      beschreibung: data.get('beschreibung')?.toString().trim() || '',
      laerm: data.get('laerm')?.toString() || 'ruhig',
      bildUrl: data.get('bildUrl')?.toString().trim() || '',
      wlan: data.get('wlan') === 'on',
      steckdosen: data.get('steckdosen') === 'on',
      erstelltVon: locals.user.email, // Wer hat den Spot erstellt
      erstelltAm: new Date()
    };

    if (!spot.name || !spot.strasse || !spot.plz || !spot.ort) {
      return fail(400, { error: 'Bitte alle Pflichtfelder ausfüllen.' });
    }

    const db = await getDb();
    await db.collection('spots').insertOne(spot);

    redirect(303, '/spots');
  }
};
