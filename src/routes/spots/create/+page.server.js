import { getDb } from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const strasse = form.get('strasse')?.toString().trim();
		const plz = form.get('plz')?.toString().trim();
		const ort = form.get('ort')?.toString().trim();
		const beschreibung = form.get('beschreibung')?.toString().trim() ?? '';
		const wlan = form.get('wlan') === 'on';
		const laerm = form.get('laerm')?.toString() ?? 'ruhig';
		const steckdosen = form.get('steckdosen') === 'on';
		const bildUrl = form.get('bildUrl')?.toString().trim() ?? '';

		if (!name || !strasse || !plz || !ort) {
			return fail(400, { error: 'Name, Strasse, PLZ und Ort sind Pflichtfelder.', name, strasse, plz, ort });
		}

		const adresse = `${strasse}, ${plz} ${ort}`;

		try {
			const db = await getDb();
			await db.collection('spots').insertOne({
				name,
				adresse,
				beschreibung,
				wlan,
				laerm,
				steckdosen,
				bildUrl,
				erstelltAm: new Date()
			});
		} catch (e) {
			console.error('Fehler beim Speichern des Spots:', e);
			return fail(500, { error: 'Spot konnte nicht gespeichert werden.' });
		}

		redirect(303, '/spots');
	}
};
