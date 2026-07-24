import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'taskpro_vg';

if (!URI) {
  throw new Error('MONGODB_URI is missing. Copy .env.example to .env and set your Atlas URI.');
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(URI!, {
    serverSelectionTimeoutMS: 15000
  });

  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[mongo] Connected to database "${DB_NAME}"`);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('Database not connected. Call connectDb() first.');
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export { DB_NAME };
