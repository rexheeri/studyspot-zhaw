import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';

export async function load({ locals }) {
	if (!locals.user) {
		redirect(303, '/login');
	}
	return {};
}

export const actions = {
	createSpot: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Du musst eingeloggt sein, um einen Spot hinzuzufügen.' });
		}

		const data = await request.formData();

		const strasse = data.get('strasse')?.toString().trim() ?? '';
		const plz = data.get('plz')?.toString().trim() ?? '';
		const ort = data.get('ort')?.toString().trim() ?? '';

		const lat = parseFloat(data.get('lat') ?? '');
		const lng = parseFloat(data.get('lng') ?? '');

		const spot = {
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
			...(lat && lng ? { lat, lng } : {}),
			erstelltVon: locals.user.email,
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
