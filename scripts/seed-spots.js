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

const spots = [
	{
		name: 'Bibliothek ZHAW Winterthur',
		adresse: 'Technikumstrasse 9, 8400 Winterthur',
		beschreibung: '',
		laerm: 'ruhig',
		wlan: true,
		steckdosen: true,
		bildUrl: '/img/BibliothekZHAW-Winterthur/bild.png',
		erstelltAm: new Date()
	},
	{
		name: 'Bibliothek ZHAW Zürich',
		adresse: 'Lagerstrasse 41, 8004 Zürich',
		beschreibung: '',
		laerm: 'ruhig',
		wlan: true,
		steckdosen: true,
		bildUrl: '/img/BibliothekZHAW-ZH/bild.jpg',
		erstelltAm: new Date()
	},
	{
		name: 'Stadtbibliothek Winterthur',
		adresse: 'Museumstrasse 52, 8400 Winterthur',
		beschreibung: '',
		laerm: 'ruhig',
		wlan: true,
		steckdosen: false,
		bildUrl: '/img/StadtbibliothekWinterthur/Bild.jpg',
		erstelltAm: new Date()
	}
];

const client = new MongoClient(uri);

try {
	await client.connect();
	const col = client.db('studyspot-zhaw').collection('spots');
	const deleted = await col.deleteMany({});
	console.log(`${deleted.deletedCount} alte Spot(s) gelöscht.`);
	const inserted = await col.insertMany(spots);
	console.log(`${inserted.insertedCount} neue Spot(s) eingefügt.`);
} finally {
	await client.close();
}
