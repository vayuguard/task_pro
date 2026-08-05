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
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(database: Db): Promise<void> {
  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('users').createIndex({ id: 1 }, { unique: true }),
    database.collection('sessions').createIndex({ id: 1 }, { unique: true }),
    database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('tasks').createIndex({ id: 1 }, { unique: true }),
    database.collection('task_events').createIndex({ taskId: 1, createdAt: -1 }),
    database.collection('audit_events').createIndex({ createdAt: -1 })
  ]).catch((err) => console.warn('[mongo] Index setup:', err));
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
