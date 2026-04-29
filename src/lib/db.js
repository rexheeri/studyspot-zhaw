import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

let client;

export async function getDb() {
	if (!client) {
		client = new MongoClient(MONGODB_URI);
		await client.connect();
	}
	return client.db('studyspot-zhaw');
}
