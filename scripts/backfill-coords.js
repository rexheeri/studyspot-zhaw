import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const uri = envContent.match(/MONGODB_URI=(.+)/)?.[1]?.trim();

if (!uri) {
	console.error('.env hat keinen MONGODB_URI-Eintrag.');
	process.exit(1);
}

function spotAdresse(spot) {
	return (
		spot.adresse ||
		[spot.strasse, spot.plz && spot.ort ? `${spot.plz} ${spot.ort}` : spot.ort]
			.filter(Boolean)
			.join(', ')
	);
}

async function geocodiere(adresse) {
	const url =
		'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
		encodeURIComponent(adresse);
	const res = await fetch(url, {
		headers: {
			'Accept-Language': 'de',
			'User-Agent': 'StudySpotZHAW/1.0 (rexheeri@students.zhaw.ch)'
		}
	});
	const results = await res.json();
	if (!results.length) return null;
	return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const col = client.db('studyspot-zhaw').collection('spots');

	const spots = await col
		.find({ $or: [{ lat: { $exists: false } }, { lat: null }, { lng: null }] })
		.toArray();

	console.log(`${spots.length} Spot(s) ohne Koordinaten gefunden.\n`);

	let aktualisiert = 0;
	let fehler = 0;

	for (const spot of spots) {
		const adresse = spotAdresse(spot);
		if (!adresse) {
			console.log(`[SKIP] ${spot.name} (${spot._id}): keine Adresse vorhanden.`);
			fehler++;
			continue;
		}

		console.log(`Geocodiere: "${spot.name}" — ${adresse}`);

		// Nominatim-Policy: mindestens 1 Sekunde zwischen Anfragen
		await new Promise((r) => setTimeout(r, 1100));

		const coords = await geocodiere(adresse);

		if (!coords) {
			console.log(`  [FEHLER] Keine Koordinaten gefunden.`);
			fehler++;
			continue;
		}

		await col.updateOne({ _id: spot._id }, { $set: { lat: coords.lat, lng: coords.lng } });
		console.log(`  [OK] lat=${coords.lat}, lng=${coords.lng}`);
		aktualisiert++;
	}

	console.log(`\nZusammenfassung: ${aktualisiert} aktualisiert, ${fehler} nicht aktualisiert.`);
} finally {
	await client.close();
}
