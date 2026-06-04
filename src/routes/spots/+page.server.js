import { getDb } from '$lib/db.js';
import { error } from '@sveltejs/kit';
import { STATUS_FENSTER_MS } from '$lib/status.js';

export async function load() {
	try {
		const db = await getDb();
		const spots = await db.collection('spots').find({}).sort({ erstelltAm: -1 }).toArray();

		const seit = new Date(Date.now() - STATUS_FENSTER_MS);
		const checkinAgg = await db
			.collection('checkins')
			.aggregate([
				{ $match: { erstelltAm: { $gte: seit } } },
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
		console.error('Fehler beim Laden der Spots:', e);
		throw error(500, 'Spots konnten nicht geladen werden.');
	}
}
