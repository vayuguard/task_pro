/**
 * Seed / reseed the dedicated taskpro_vg MongoDB database.
 * Usage: npm run seed
 * Force: npx tsx scripts/seed-db.ts --force
 */
import { connectDb, closeDb, DB_NAME } from '../server/db.ts';
import { seedDatabase } from '../server/seed.ts';

const force = process.argv.includes('--force');

async function main() {
  console.log(`Connecting to MongoDB (database: ${DB_NAME})...`);
  const db = await connectDb();
  await seedDatabase(db, force);
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map((c) => c.name).join(', '));
  for (const name of collections.map((c) => c.name)) {
    const n = await db.collection(name).countDocuments();
    console.log(`  ${name}: ${n} docs`);
  }
  await closeDb();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
