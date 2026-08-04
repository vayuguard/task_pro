import { Db } from 'mongodb';
import { ADMIN_SEED, DEMO_MFA_CODE } from '../src/auth/auth.ts';
import { projectsHealth } from '../src/initialData.ts';

/** memberEmails = employees allowed in the channel. Admins always have access. */
const CHANNELS = [
  { name: '#general', description: 'General announcements and discussion', unread: false, memberEmails: [] as string[] },
  { name: '#website-redesign-auth', description: 'Multi-factor and login flow updates', unread: false, memberEmails: [] as string[] },
  { name: '#devops-security', description: 'CI/CD pipeline and secrets audit', unread: false, memberEmails: [] as string[] },
  { name: '#billing-stripe', description: 'Stripe transaction hooks and logs', unread: false, memberEmails: [] as string[] }
];

/** Seed only admin credentials. Employees are created by admin later. */
export async function seedDatabase(db: Db, force = false): Promise<void> {
  const usersCol = db.collection('users');
  const existing = await usersCol.countDocuments();

  if (existing > 0 && !force) {
    // Soft-migrate older channels that lack memberEmails
    await db.collection('chat_channels').updateMany(
      { memberEmails: { $exists: false } },
      { $set: { memberEmails: [] } }
    );

    // Keep admin login in sync with ADMIN_SEED without wiping employees
    const admin = ADMIN_SEED;
    await usersCol.updateMany(
      { $or: [{ id: admin.id }, { role: 'admin' }] },
      {
        $set: {
          id: admin.id,
          email: admin.email.toLowerCase(),
          password: admin.password,
          role: admin.role,
          mfaRequired: admin.mfaRequired,
          profile: admin.profile
        }
      }
    );
    await db.collection('team_members').updateOne(
      {
        $or: [
          { email: admin.email.toLowerCase() },
          { email: 'admin@taskpro.com' },
          { role: 'Admin' }
        ]
      },
      {
        $set: {
          name: admin.profile.name,
          email: admin.email.toLowerCase(),
          avatar: admin.profile.avatar,
          role: admin.profile.role || 'Admin'
        }
      },
      { upsert: true }
    );

    console.log(`[mongo] Already has data — skip full seed; admin synced to ${admin.email}`);
    return;
  }

  if (force) {
    await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('tasks').deleteMany({}),
      db.collection('employees').deleteMany({}),
      db.collection('progress_logs').deleteMany({}),
      db.collection('projects_health').deleteMany({}),
      db.collection('team_members').deleteMany({}),
      db.collection('chat_channels').deleteMany({}),
      db.collection('chat_messages').deleteMany({}),
      db.collection('meta').deleteMany({}),
      db.collection('mail_log').deleteMany({})
    ]);
  }

  console.log('[mongo] Seeding admin-only database taskpro_vg...');

  const admin = ADMIN_SEED;
  await usersCol.insertOne({
    id: admin.id,
    email: admin.email.toLowerCase(),
    password: admin.password,
    role: admin.role,
    mfaRequired: admin.mfaRequired,
    profile: admin.profile,
    createdAt: new Date()
  });

  // Admin appears in team directory so they can assign/report
  await db.collection('team_members').insertOne({
    name: admin.profile.name,
    email: admin.email.toLowerCase(),
    avatar: admin.profile.avatar,
    role: admin.profile.role || 'Admin'
  });

  await db.collection('projects_health').insertMany(projectsHealth.map((p) => ({ ...p })));
  await db.collection('chat_channels').insertMany(CHANNELS.map((c) => ({ ...c })));

  await db.collection('chat_messages').insertOne({
    id: 'welcome-1',
    channel: '#general',
    sender: admin.profile,
    text: 'Welcome to TaskPro. Create employees from Settings → Team to invite your team.',
    timestamp: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    reactions: {},
    createdAt: new Date()
  });

  // No sample tasks / employees — admin creates them
  await db.collection('meta').insertOne({
    key: 'app',
    name: 'TaskPro',
    database: 'taskpro_vg',
    demoMfaCode: DEMO_MFA_CODE,
    seedMode: 'admin-only',
    seededAt: new Date()
  });

  console.log(`[mongo] Seed complete — admin: ${admin.email} / ${admin.password}`);
}
