/**
 * Force-update admin MFA in MongoDB meta + verify what is stored.
 * Usage: npx tsx scripts/sync-mfa.ts
 */
import { connectDb, closeDb } from '../server/db.ts';
import { DEMO_MFA_CODE, ADMIN_SEED } from '../src/auth/auth.ts';
import { hashPassword } from '../server/auth/password.ts';

async function main() {
  const db = await connectDb();

  await db.collection('meta').updateOne(
    { key: 'app' },
    {
      $set: {
        demoMfaCode: DEMO_MFA_CODE,
        updatedAt: new Date()
      },
      $setOnInsert: {
        key: 'app',
        name: 'TaskPro',
        database: 'taskpro_vg',
        seedMode: 'admin-only',
        seededAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection('users').updateMany(
    { $or: [{ id: ADMIN_SEED.id }, { role: 'admin' }] },
    {
      $set: {
        id: ADMIN_SEED.id,
        email: ADMIN_SEED.email.toLowerCase(),
        password: hashPassword(ADMIN_SEED.password),
        role: ADMIN_SEED.role,
        mfaRequired: true,
        profile: ADMIN_SEED.profile
      }
    }
  );

  const meta = await db.collection('meta').findOne({ key: 'app' });
  const admin = await db.collection('users').findOne(
    { role: 'admin' },
    { projection: { email: 1, mfaRequired: 1, 'profile.name': 1 } }
  );

  console.log('Code constant DEMO_MFA_CODE:', DEMO_MFA_CODE);
  console.log('Mongo meta.demoMfaCode:', meta?.demoMfaCode);
  console.log('Admin email:', admin?.email);
  console.log('Match:', meta?.demoMfaCode === DEMO_MFA_CODE ? 'OK' : 'MISMATCH');

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
