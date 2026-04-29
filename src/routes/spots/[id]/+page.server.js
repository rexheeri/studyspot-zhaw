import { getDb } from '$lib/db.js';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function load({ params }) {
	if (!ObjectId.isValid(params.id)) throw error(404, 'Spot nicht gefunden.');

	try {
		const db = await getDb();
		const spot = await db.collection('spots').findOne({ _id: new ObjectId(params.id) });
		if (!spot) throw error(404, 'Spot nicht gefunden.');

		const reviews = await db
			.collection('reviews')
			.find({ spotId: params.id })
			.sort({ erstelltAm: -1 })
			.toArray();

		return {
			spot: { ...spot, _id: spot._id.toString() },
			reviews: reviews.map((r) => ({ ...r, _id: r._id.toString() }))
		};
	} catch (e) {
		if (e.status) throw e;
		console.error('Fehler beim Laden des Spots:', e);
		throw error(500, 'Spot konnte nicht geladen werden.');
	}
}

export const actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const autorName = form.get('autorName')?.toString().trim();
		const sterne = parseInt(form.get('sterne') ?? '5');
		const kommentar = form.get('kommentar')?.toString().trim();

		if (!autorName || !kommentar || sterne < 1 || sterne > 5) {
			return { success: false, error: 'Bitte alle Felder ausfüllen.' };
		}

		try {
			const db = await getDb();
			await db.collection('reviews').insertOne({
				spotId: params.id,
				autorName,
				sterne,
				kommentar,
				erstelltAm: new Date()
			});
			return { success: true };
		} catch (e) {
			console.error('Fehler beim Speichern des Reviews:', e);
			return { success: false, error: 'Bewertung konnte nicht gespeichert werden.' };
		}
	}
};
