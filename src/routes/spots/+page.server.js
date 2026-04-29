import { getDb } from '$lib/db.js';
import { error } from '@sveltejs/kit';

export async function load() {
	try {
		const db = await getDb();
		const spots = await db.collection('spots').find({}).sort({ erstelltAm: -1 }).toArray();
		return {
			spots: spots.map((s) => ({ ...s, _id: s._id.toString() }))
		};
	} catch (e) {
		console.error('Fehler beim Laden der Spots:', e);
		throw error(500, 'Spots konnten nicht geladen werden.');
	}
}
