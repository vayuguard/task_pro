import { Router, Request, Response } from 'express';
import { getDb } from './db.ts';
import { DEMO_MFA_CODE } from '../src/auth/auth.ts';
import { normalizeTask, normalizeTasks } from '../src/utils/tasks.ts';
import { sendEmployeeCredentials } from './mail.ts';

function stripMongoId<T extends Record<string, unknown>>(doc: T | null): Omit<T, '_id'> | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  void _id;
  return rest as Omit<T, '_id'>;
}

function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
}

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    try {
      const db = getDb();
      await db.command({ ping: 1 });
      res.json({ ok: true, database: db.databaseName });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) {
        res.status(400).json({ ok: false, error: 'Email and password required.' });
        return;
      }

      const account = await getDb().collection('users').findOne({
        email: email.trim().toLowerCase(),
        password
      });

      if (!account) {
        res.status(401).json({ ok: false, error: 'Invalid email or password.' });
        return;
      }

      const session = {
        userId: account.id as string,
        email: account.email as string,
        role: account.role as string,
        profile: account.profile,
        mfaVerified: !(account.mfaRequired as boolean),
        loginAt: new Date().toISOString()
      };

      res.json({ ok: true, session, mfaRequired: account.mfaRequired });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/auth/mfa', async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body as { email?: string; code?: string };
      if (!email || !code) {
        res.status(400).json({ ok: false, error: 'Email and code required.' });
        return;
      }
      if (code.trim() !== DEMO_MFA_CODE) {
        res.status(401).json({ ok: false, error: 'Invalid verification code.' });
        return;
      }

      const account = await getDb().collection('users').findOne({
        email: email.trim().toLowerCase()
      });
      if (!account) {
        res.status(401).json({ ok: false, error: 'No active session. Please log in again.' });
        return;
      }

      const session = {
        userId: account.id as string,
        email: account.email as string,
        role: account.role as string,
        profile: account.profile,
        mfaVerified: true,
        loginAt: new Date().toISOString()
      };
      res.json({ ok: true, session });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/bootstrap', async (_req, res) => {
    try {
      const db = getDb();
      const [tasks, employees, progressLogs, projectsHealth, teamMembers, channels] = await Promise.all([
        db.collection('tasks').find({}).toArray(),
        db.collection('employees').find({}).toArray(),
        db.collection('progress_logs').find({}).toArray(),
        db.collection('projects_health').find({}).toArray(),
        db.collection('team_members').find({}).toArray(),
        db.collection('chat_channels').find({}).toArray()
      ]);

      res.json({
        ok: true,
        tasks: normalizeTasks(tasks.map((t) => stripMongoId(t) as never)),
        employees: employees.map((e) => stripMongoId(e)),
        progressLogs: progressLogs.map((l) => stripMongoId(l)),
        projectsHealth: projectsHealth.map((p) => stripMongoId(p)),
        teamMembers: teamMembers.map((m) => stripMongoId(m)),
        channels: channels.map((c) => stripMongoId(c))
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/employees', async (_req, res) => {
    try {
      const users = await getDb()
        .collection('users')
        .find({ role: 'employee' })
        .project({ password: 0 })
        .toArray();
      res.json({
        ok: true,
        employees: users.map((u) => stripMongoId(u))
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/employees', async (req: Request, res: Response) => {
    try {
      const { name, email, password, jobTitle, createdBy } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        jobTitle?: string;
        createdBy?: string;
      };

      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
        return;
      }

      if (password.trim().length < 6) {
        res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
        return;
      }

      const emailNorm = email.trim().toLowerCase();
      const db = getDb();

      const existing = await db.collection('users').findOne({ email: emailNorm });
      if (existing) {
        res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
        return;
      }

      const employeeId = `emp-${Date.now()}`;
      const title = jobTitle?.trim() || 'Employee';
      const profile = {
        name: name.trim(),
        email: emailNorm,
        role: title,
        avatar: avatarFor(name.trim())
      };

      const userDoc = {
        id: employeeId,
        email: emailNorm,
        password: password.trim(),
        role: 'employee' as const,
        mfaRequired: false,
        profile,
        createdAt: new Date(),
        createdBy: createdBy || 'admin'
      };

      await db.collection('users').insertOne(userDoc);

      await db.collection('team_members').insertOne({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role
      });

      await db.collection('employees').insertOne({
        id: employeeId,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar,
        velocity: 0,
        completionRate: 0,
        feedbackScore: 0,
        trend: 0,
        tasksCompleted: 0,
        kudos: 0
      });

      const mailResult = await sendEmployeeCredentials({
        to: emailNorm,
        name: profile.name,
        employeeId,
        email: emailNorm,
        password: password.trim()
      });

      await db.collection('mail_log').insertOne({
        to: emailNorm,
        employeeId,
        type: 'credentials',
        mode: mailResult.mode,
        sent: mailResult.sent,
        preview: mailResult.preview,
        createdAt: new Date()
      });

      res.json({
        ok: true,
        employee: {
          id: employeeId,
          email: emailNorm,
          role: 'employee',
          profile,
          createdAt: userDoc.createdAt
        },
        emailDelivery: {
          sent: mailResult.sent,
          mode: mailResult.mode,
          preview: mailResult.mode === 'console' ? mailResult.preview : undefined
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/employees/:id', async (req: Request, res: Response) => {
    try {
      const employeeId = decodeURIComponent(req.params.id);
      const role = String(req.query.role || req.body?.role || '').trim();
      if (role && role !== 'admin') {
        res.status(403).json({ ok: false, error: 'Only admin can delete employees.' });
        return;
      }

      const db = getDb();
      const user = await db.collection('users').findOne({ id: employeeId });
      if (!user) {
        res.status(404).json({ ok: false, error: 'Employee not found.' });
        return;
      }
      if (user.role === 'admin') {
        res.status(403).json({ ok: false, error: 'Cannot delete an admin account.' });
        return;
      }

      const emailNorm = String(user.email || '').toLowerCase();

      await Promise.all([
        db.collection('users').deleteOne({ id: employeeId }),
        db.collection('employees').deleteOne({ id: employeeId }),
        emailNorm
          ? db.collection('team_members').deleteMany({ email: emailNorm })
          : Promise.resolve(),
        emailNorm
          ? db.collection('chat_channels').updateMany(
              { memberEmails: emailNorm },
              { $pull: { memberEmails: emailNorm } }
            )
          : Promise.resolve()
      ]);

      res.json({ ok: true, deleted: employeeId, email: emailNorm || null });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/tasks', async (_req, res) => {
    try {
      const docs = await getDb().collection('tasks').find({}).toArray();
      res.json({ ok: true, tasks: normalizeTasks(docs.map((t) => stripMongoId(t) as never)) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/tasks', async (req, res) => {
    try {
      const task = normalizeTask(req.body);
      await getDb().collection('tasks').insertOne({ ...task, updatedAt: new Date() });
      res.json({ ok: true, task });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.put('/tasks/:id', async (req, res) => {
    try {
      const task = normalizeTask({ ...req.body, id: req.params.id });
      await getDb().collection('tasks').updateOne(
        { id: req.params.id },
        { $set: { ...task, updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ ok: true, task });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/tasks/:id', async (req, res) => {
    try {
      await getDb().collection('tasks').deleteOne({ id: req.params.id });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/progress-logs', async (_req, res) => {
    try {
      const logs = await getDb().collection('progress_logs').find({}).toArray();
      res.json({ ok: true, logs: logs.map((l) => stripMongoId(l)) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/progress-logs', async (req, res) => {
    try {
      const log = { ...req.body, createdAt: new Date() };
      await getDb().collection('progress_logs').insertOne(log);
      res.json({ ok: true, log: stripMongoId(log) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // ── Chat (membership: admin sees all; employees only memberEmails) ──
  async function getChannelDoc(name: string) {
    return getDb().collection('chat_channels').findOne({ name });
  }

  function normalizeMemberEmails(emails: unknown): string[] {
    if (!Array.isArray(emails)) return [];
    return [...new Set(emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean))];
  }

  function isAdminRole(role?: string) {
    return role === 'admin';
  }

  function canAccessChannel(
    channel: { memberEmails?: string[] } | null,
    email: string | undefined,
    role: string | undefined
  ) {
    if (!channel) return false;
    if (isAdminRole(role)) return true;
    if (!email) return false;
    const members = normalizeMemberEmails(channel.memberEmails);
    return members.includes(email.trim().toLowerCase());
  }

  router.get('/chat-channels', async (req, res) => {
    try {
      const email = String(req.query.email || '').trim().toLowerCase();
      const role = String(req.query.role || '').trim();
      if (!email || !role) {
        res.status(400).json({ ok: false, error: 'email and role query params required.' });
        return;
      }

      const all = await getDb().collection('chat_channels').find({}).toArray();
      const visible = isAdminRole(role)
        ? all
        : all.filter((c) => canAccessChannel(c as { memberEmails?: string[] }, email, role));

      const withCounts = await Promise.all(
        visible.map(async (c) => {
          const count = await getDb().collection('chat_messages').countDocuments({ channel: c.name });
          const stripped = stripMongoId(c) as Record<string, unknown>;
          return {
            ...stripped,
            memberEmails: normalizeMemberEmails(c.memberEmails),
            messageCount: count
          };
        })
      );
      res.json({ ok: true, channels: withCounts });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/chat-channels', async (req, res) => {
    try {
      let { name, description, memberEmails, role, email } = req.body as {
        name?: string;
        description?: string;
        memberEmails?: string[];
        role?: string;
        email?: string;
      };
      if (!isAdminRole(role)) {
        res.status(403).json({ ok: false, error: 'Only admin can create channels.' });
        return;
      }
      if (!name?.trim()) {
        res.status(400).json({ ok: false, error: 'Channel name is required.' });
        return;
      }
      name = name.trim().startsWith('#') ? name.trim().toLowerCase() : `#${name.trim().toLowerCase()}`;
      name = name.replace(/\s+/g, '-').replace(/[^a-z0-9#-]/g, '');
      const existing = await getDb().collection('chat_channels').findOne({ name });
      if (existing) {
        res.status(409).json({ ok: false, error: 'Channel already exists.' });
        return;
      }
      const members = normalizeMemberEmails(memberEmails);
      const channel = {
        name,
        description: description?.trim() || 'Team discussion',
        unread: false,
        memberEmails: members,
        createdBy: email?.trim().toLowerCase() || null,
        createdAt: new Date()
      };
      await getDb().collection('chat_channels').insertOne(channel);
      res.json({ ok: true, channel: { ...stripMongoId(channel), memberEmails: members } });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.put('/chat-channels/:channel/members', async (req, res) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
      const { memberEmails, role } = req.body as { memberEmails?: string[]; role?: string };
      if (!isAdminRole(role)) {
        res.status(403).json({ ok: false, error: 'Only admin can manage channel members.' });
        return;
      }
      const existing = await getChannelDoc(channelName);
      if (!existing) {
        res.status(404).json({ ok: false, error: 'Channel not found.' });
        return;
      }
      const members = normalizeMemberEmails(memberEmails);
      await getDb()
        .collection('chat_channels')
        .updateOne({ name: channelName }, { $set: { memberEmails: members, updatedAt: new Date() } });
      const updated = await getChannelDoc(channelName);
      res.json({
        ok: true,
        channel: {
          ...stripMongoId(updated as Record<string, unknown>),
          memberEmails: members
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/chat-channels/:channel/members/:email', async (req, res) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
      const memberEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
      const role = String(req.query.role || req.body?.role || '').trim();
      if (!isAdminRole(role)) {
        res.status(403).json({ ok: false, error: 'Only admin can remove members.' });
        return;
      }
      const existing = await getChannelDoc(channelName);
      if (!existing) {
        res.status(404).json({ ok: false, error: 'Channel not found.' });
        return;
      }
      const members = normalizeMemberEmails(existing.memberEmails).filter((e) => e !== memberEmail);
      await getDb()
        .collection('chat_channels')
        .updateOne({ name: channelName }, { $set: { memberEmails: members, updatedAt: new Date() } });
      const updated = await getChannelDoc(channelName);
      res.json({
        ok: true,
        channel: {
          ...stripMongoId(updated as Record<string, unknown>),
          memberEmails: members
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/chat-channels/:channel', async (req, res) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
      const role = String(req.query.role || '').trim();
      if (!isAdminRole(role)) {
        res.status(403).json({ ok: false, error: 'Only admin can delete channels.' });
        return;
      }
      const existing = await getChannelDoc(channelName);
      if (!existing) {
        res.status(404).json({ ok: false, error: 'Channel not found.' });
        return;
      }
      const db = getDb();
      await Promise.all([
        db.collection('chat_channels').deleteOne({ name: channelName }),
        db.collection('chat_messages').deleteMany({ channel: channelName })
      ]);
      res.json({ ok: true, deleted: channelName });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/chat/:channel', async (req, res) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const email = String(req.query.email || '').trim().toLowerCase();
      const role = String(req.query.role || '').trim();
      const doc = await getChannelDoc(channel);
      if (!canAccessChannel(doc as { memberEmails?: string[] } | null, email, role)) {
        res.status(403).json({ ok: false, error: 'You are not a member of this channel.' });
        return;
      }
      const messages = await getDb()
        .collection('chat_messages')
        .find({ channel })
        .sort({ createdAt: 1 })
        .toArray();
      res.json({ ok: true, messages: messages.map((m) => stripMongoId(m)) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/chat/:channel', async (req, res) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const text = String(req.body.text || '').trim();
      const role = String(req.body.role || '').trim();
      const sender = req.body.sender as { email?: string; name?: string } | undefined;
      const email = String(sender?.email || req.body.email || '').trim().toLowerCase();

      if (!text) {
        res.status(400).json({ ok: false, error: 'Message text is required.' });
        return;
      }
      const doc = await getChannelDoc(channel);
      if (!canAccessChannel(doc as { memberEmails?: string[] } | null, email, role)) {
        res.status(403).json({ ok: false, error: 'You are not a member of this channel.' });
        return;
      }

      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel,
        sender: req.body.sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {} as Record<string, string[]>,
        createdAt: new Date()
      };
      await getDb().collection('chat_messages').insertOne(msg);
      res.json({ ok: true, message: stripMongoId(msg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/chat/:channel/:messageId/react', async (req, res) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const messageId = req.params.messageId;
      const { emoji, userKey, email, role } = req.body as {
        emoji?: string;
        userKey?: string;
        email?: string;
        role?: string;
      };
      if (!emoji || !userKey) {
        res.status(400).json({ ok: false, error: 'emoji and userKey required.' });
        return;
      }
      const doc = await getChannelDoc(channel);
      if (!canAccessChannel(doc as { memberEmails?: string[] } | null, email, role)) {
        res.status(403).json({ ok: false, error: 'You are not a member of this channel.' });
        return;
      }

      const col = getDb().collection('chat_messages');
      const msg = await col.findOne({ id: messageId, channel });
      if (!msg) {
        res.status(404).json({ ok: false, error: 'Message not found.' });
        return;
      }

      const reactions = { ...((msg.reactions as Record<string, string[]>) || {}) };
      const list = reactions[emoji] || [];
      if (list.includes(userKey)) {
        reactions[emoji] = list.filter((u) => u !== userKey);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...list, userKey];
      }

      await col.updateOne({ id: messageId, channel }, { $set: { reactions } });
      const updated = await col.findOne({ id: messageId, channel });
      res.json({ ok: true, message: stripMongoId(updated as Record<string, unknown>) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  return router;
}
