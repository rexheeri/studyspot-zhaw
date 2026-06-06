import { fail, redirect, error } from '@sveltejs/kit';
import { getDb } from '$lib/db.js';
import { ObjectId } from 'mongodb';
import { STATUS_FENSTER_MS } from '$lib/status.js';

export async function load({ locals }) {
	if (!locals.user) {
		redirect(303, '/login');
	}

	try {
		const db = await getDb();

		const eintraege = await db.collection('favorites').find({ userId: locals.user.id }).toArray();

		if (eintraege.length === 0) {
			return { spots: [] };
		}

		const spotIds = eintraege.map((e) => e.spotId);

		const spots = await db
			.collection('spots')
			.find({ _id: { $in: spotIds } })
			.toArray();

		// Live-Status berechnen (gleiche Aggregation wie /spots)
		const seit = new Date(Date.now() - STATUS_FENSTER_MS);
		const checkinAgg = await db
			.collection('checkins')
			.aggregate([
				{ $match: { spotId: { $in: spotIds }, erstelltAm: { $gte: seit } } },
				{
					$addFields: {
						wert: {
							$switch: {
								branches: [
									{ case: { $eq: ['$status', 'ruhig'] }, then: 1 },
									{ case: { $eq: ['$status', 'mittel'] }, then: 2 },
									{ case: { $eq: ['$status', 'voll'] }, then: 3 }
								],
								default: 2
							}
						}
					}
				},
				{ $group: { _id: '$spotId', sumWert: { $sum: '$wert' }, count: { $sum: 1 } } }
			])
			.toArray();

		const statusMap = Object.fromEntries(
			checkinAgg.map((c) => {
				const avg = c.sumWert / c.count;
				const status = avg <= 1.5 ? 'ruhig' : avg <= 2.5 ? 'mittel' : 'voll';
				return [c._id.toString(), status];
			})
		);

		return {
			spots: spots.map((s) => ({
				...s,
				_id: s._id.toString(),
				currentStatus: statusMap[s._id.toString()] ?? null
			}))
		};
	} catch (e) {
		console.error('Fehler beim Laden der Favoriten:', e);
		throw error(500, 'Favoriten konnten nicht geladen werden.');
	}
}

export const actions = {
	removeFavorit: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Nicht autorisiert.' });
		}

		const data = await request.formData();
		const spotId = data.get('spotId')?.toString();

		if (!spotId) {
			return fail(400, { error: 'Spot-ID fehlt.' });
		}

		try {
			const db = await getDb();
			await db.collection('favorites').deleteOne({
				userId: locals.user.id,
				spotId: new ObjectId(spotId)
			});
		} catch (e) {
			console.error('Fehler beim Entfernen des Favoriten:', e);
			return fail(500, { error: 'Favorit konnte nicht entfernt werden.' });
		}

		return { removeSuccess: true };
	}
};
