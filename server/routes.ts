import { Router, Request, Response } from 'express';
import { getDb } from './db.ts';
import { DEMO_MFA_CODE } from '../src/auth/auth.ts';
import { normalizeTask, normalizeTasks, isTaskAssignedToUser } from '../src/utils/tasks.ts';
import { sendEmployeeCredentials } from './mail.ts';
import { verifyPassword, hashPassword } from './auth/password.ts';
import { createSession, destroySession, getSession } from './auth/session.ts';
import { requireAuth, requireAdmin, sessionToClient, type AuthedRequest } from './middleware/auth.ts';
import { transitionTaskOnServer, markLegacyTasks, enrichTaskForClient, reassignTask } from './taskService.ts';
import { computePerformanceScore, computeTeamPerformance } from './scoring.ts';
import type { ScheduleExceptionDoc } from './scheduleExceptions.ts';
import type { Task, TaskStatus } from '../src/types.ts';
import { formatTimeIST } from '../src/utils/time.ts';

function stripMongoId<T extends Record<string, unknown>>(doc: T | null): Omit<T, '_id'> | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  void _id;
  return rest as Omit<T, '_id'>;
}

function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
}

async function appendAudit(
  actor: { email: string; role: string },
  action: string,
  target: string,
  detail: Record<string, unknown> = {}
) {
  await getDb().collection('audit_events').insertOne({
    actor,
    action,
    target,
    detail,
    createdAt: new Date()
  });
}

async function appendTaskEvent(taskId: string, type: string, actor: string, payload: Record<string, unknown>) {
  await getDb().collection('task_events').insertOne({
    taskId,
    type,
    actor,
    payload,
    createdAt: new Date()
  });
}

function employeeAllowedFields(body: Partial<Task>): Partial<Task> {
  const allowed = ['title', 'description', 'labels', 'subtasks', 'attachments', 'activity', 'priority', 'dueDate'];
  const out: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) out[k] = (body as Record<string, unknown>)[k];
  }
  return out as Partial<Task>;
}

async function loadScheduleExceptions(): Promise<ScheduleExceptionDoc[]> {
  const docs = await getDb().collection('schedule_exceptions').find({}).toArray();
  return docs.map((d) => ({
    email: String(d.email),
    startHour: Number(d.startHour),
    endHour: Number(d.endHour),
    workDays: Array.isArray(d.workDays) ? (d.workDays as number[]) : undefined
  }));
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
        email: email.trim().toLowerCase()
      });

      if (!account || !verifyPassword(password, String(account.password))) {
        res.status(401).json({ ok: false, error: 'Invalid email or password.' });
        return;
      }

      const serverSession = await createSession(res, {
        userId: account.id as string,
        email: account.email as string,
        role: account.role as 'admin' | 'employee',
        profile: account.profile as { name: string; email?: string; avatar: string; role?: string },
        mfaVerified: !(account.mfaRequired as boolean)
      });

      res.json({
        ok: true,
        session: sessionToClient(serverSession),
        mfaRequired: account.mfaRequired
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/auth/mfa', async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body as { email?: string; code?: unknown };
      if (!email || code == null || String(code).trim() === '') {
        res.status(400).json({ ok: false, error: 'Email and code required.' });
        return;
      }

      // Keep MFA as a string so formatting is never altered.
      const submitted = String(code).trim().replace(/\s+/g, '');
      const meta = await getDb().collection('meta').findOne({ key: 'app' });
      const expected = String(meta?.demoMfaCode || DEMO_MFA_CODE).trim();
      if (submitted !== expected) {
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

      const session = await createSession(res, {
        userId: account.id as string,
        email: account.email as string,
        role: account.role as 'admin' | 'employee',
        profile: account.profile as { name: string; email?: string; avatar: string; role?: string },
        mfaVerified: true
      });
      res.json({ ok: true, session: sessionToClient(session) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/auth/logout', async (req, res) => {
    await destroySession(req, res);
    res.json({ ok: true });
  });

  router.get('/auth/me', requireAuth, async (req: AuthedRequest, res) => {
    res.json({ ok: true, session: sessionToClient(req.session!) });
  });

  router.get('/bootstrap', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const db = getDb();
      const session = req.session!;
      const isAdmin = session.role === 'admin';

      const [allTasks, employees, progressLogs, projectsHealth, teamMembers, channels] =
        await Promise.all([
          db.collection('tasks').find({}).toArray(),
          db.collection('employees').find({}).toArray(),
          db.collection('progress_logs').find({}).toArray(),
          db.collection('projects_health').find({}).toArray(),
          db.collection('team_members').find({}).toArray(),
          db.collection('chat_channels').find({}).toArray()
        ]);

      const normalized = markLegacyTasks(
        normalizeTasks(allTasks.map((t) => stripMongoId(t) as never))
      );
      const tasks = isAdmin
        ? normalized
        : normalized.filter((t) =>
            isTaskAssignedToUser(t, { ...session.profile, email: session.email })
          );

      res.json({
        ok: true,
        tasks,
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

  router.get('/employees', requireAuth, requireAdmin, async (_req, res) => {
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

  router.post('/employees', requireAuth, requireAdmin, async (req: AuthedRequest, res: Response) => {
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
        password: hashPassword(password.trim()),
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

  router.delete('/employees/:id', requireAuth, requireAdmin, async (req: AuthedRequest, res: Response) => {
    try {
      const employeeId = decodeURIComponent(req.params.id);

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
              { $pull: { memberEmails: emailNorm } } as Record<string, unknown>
            )
          : Promise.resolve()
      ]);

      res.json({ ok: true, deleted: employeeId, email: emailNorm || null });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/tasks', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const docs = await getDb().collection('tasks').find({}).toArray();
      let tasks = markLegacyTasks(normalizeTasks(docs.map((t) => stripMongoId(t) as never)));
      if (req.session!.role !== 'admin') {
        tasks = tasks.filter((t) =>
          isTaskAssignedToUser(t, { ...req.session!.profile, email: req.session!.email })
        );
      }
      res.json({ ok: true, tasks });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/tasks', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const task = normalizeTask({ ...req.body, timingTrust: 'certified', version: 0 });
      await getDb().collection('tasks').insertOne({ ...task, updatedAt: new Date() });
      await appendTaskEvent(task.id, 'created', req.session!.email, { status: task.status });
      res.json({ ok: true, task });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/tasks/:id/transition', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const taskId = req.params.id;
      const { status, expectedVersion } = req.body as { status?: TaskStatus; expectedVersion?: number };
      if (!status) {
        res.status(400).json({ ok: false, error: 'status required' });
        return;
      }

      const col = getDb().collection('tasks');
      const existing = await col.findOne({ id: taskId });
      if (!existing) {
        res.status(404).json({ ok: false, error: 'Task not found' });
        return;
      }

      const prev = normalizeTask(stripMongoId(existing) as Task);
      const session = req.session!;

      if (
        session.role !== 'admin' &&
        !isTaskAssignedToUser(prev, { ...session.profile, email: session.email })
      ) {
        res.status(403).json({ ok: false, error: 'Not your task.' });
        return;
      }

      if (expectedVersion != null && (prev.version || 0) !== expectedVersion) {
        res.status(409).json({ ok: false, error: 'Task was updated elsewhere. Refresh and retry.' });
        return;
      }

      const actor = { ...session.profile, email: session.email };
      const exceptions = await loadScheduleExceptions();
      const task = enrichTaskForClient(
        transitionTaskOnServer(prev, status, actor, new Date(), exceptions),
        new Date(),
        exceptions
      );
      await col.updateOne({ id: taskId }, { $set: { ...task, updatedAt: new Date() } });
      await appendTaskEvent(taskId, 'transition', session.email, {
        from: prev.status,
        to: status,
        version: task.version
      });
      res.json({ ok: true, task });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.put('/tasks/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const taskId = req.params.id;
      const col = getDb().collection('tasks');
      const existing = await col.findOne({ id: taskId });
      if (!existing) {
        res.status(404).json({ ok: false, error: 'Task not found' });
        return;
      }

      const prev = normalizeTask(stripMongoId(existing) as Task);
      const session = req.session!;
      const isAdmin = session.role === 'admin';

      if (
        !isAdmin &&
        !isTaskAssignedToUser(prev, { ...session.profile, email: session.email })
      ) {
        res.status(403).json({ ok: false, error: 'Not your task.' });
        return;
      }

      let patch: Partial<Task> = req.body;
      const estimateReason =
        typeof (req.body as { estimateReason?: string }).estimateReason === 'string'
          ? (req.body as { estimateReason?: string }).estimateReason!.trim()
          : '';
      delete (patch as Record<string, unknown>).estimateReason;

      if (!isAdmin) {
        patch = employeeAllowedFields(patch);
        // Employees cannot change status via PUT — use transition endpoint
        delete (patch as Record<string, unknown>).status;
        delete (patch as Record<string, unknown>).statusHistory;
        delete (patch as Record<string, unknown>).timeLogged;
        delete (patch as Record<string, unknown>).completedAt;
        delete (patch as Record<string, unknown>).assignee;
        delete (patch as Record<string, unknown>).timeEstimated;
        delete (patch as Record<string, unknown>).timingTrust;
      } else {
        if (
          patch.timeEstimated != null &&
          patch.timeEstimated !== prev.timeEstimated &&
          !estimateReason
        ) {
          res.status(400).json({ ok: false, error: 'Reason required to change estimate.' });
          return;
        }
        // Admin: strip client-forged timing fields; use transition for status
        if (patch.status && patch.status !== prev.status) {
          const actor = { ...session.profile, email: session.email };
          const exceptions = await loadScheduleExceptions();
          const transitioned = transitionTaskOnServer(
            { ...prev, ...patch, status: prev.status },
            patch.status,
            actor,
            new Date(),
            exceptions
          );
          patch = { ...patch, ...transitioned };
        }
        delete (patch as Record<string, unknown>).statusHistory;
        delete (patch as Record<string, unknown>).timeLogged;
      }

      let merged = normalizeTask({ ...prev, ...patch, id: taskId });
      const exceptions = await loadScheduleExceptions();
      if (isAdmin && patch.assignee && patch.assignee.email !== prev.assignee.email) {
        merged = reassignTask(merged, patch.assignee, new Date(), exceptions);
      }
      merged = enrichTaskForClient(merged, new Date(), exceptions);
      await col.updateOne({ id: taskId }, { $set: { ...merged, updatedAt: new Date() } });
      if (
        isAdmin &&
        patch.timeEstimated != null &&
        patch.timeEstimated !== prev.timeEstimated
      ) {
        await appendAudit(
          { email: session.email, role: session.role },
          'task.estimate.change',
          taskId,
          { from: prev.timeEstimated, to: patch.timeEstimated, reason: estimateReason }
        );
      }
      await appendAudit(
        { email: session.email, role: session.role },
        'task.update',
        taskId,
        { fields: Object.keys(patch) }
      );
      res.json({ ok: true, task: merged });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/tasks/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      await getDb().collection('tasks').deleteOne({ id: req.params.id });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/performance', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const session = req.session!;
      const period = String(req.query.period || '30d');
      const userId = String(req.query.userId || '').toLowerCase();

      const end = new Date();
      const start = new Date();
      if (period === '7d') start.setDate(start.getDate() - 7);
      else if (period === '90d') start.setDate(start.getDate() - 90);
      else start.setDate(start.getDate() - 30);

      const docs = await getDb().collection('tasks').find({}).toArray();
      const tasks = markLegacyTasks(normalizeTasks(docs.map((t) => stripMongoId(t) as never)));
      const members = await getDb().collection('team_members').find({}).toArray();
      const users = members.map((m) => stripMongoId(m) as { name: string; email?: string; avatar: string; role?: string });

      if (session.role === 'admin' && !userId) {
        const scores = computeTeamPerformance(
          tasks,
          users.map((u) => ({ name: u.name, avatar: u.avatar, email: u.email, role: u.role })),
          start,
          end
        );
        res.json({ ok: true, period, scores });
        return;
      }

      const targetEmail = userId || session.email.toLowerCase();
      const target = users.find((u) => (u.email || u.name).toLowerCase() === targetEmail) || session.profile;

      if (
        session.role !== 'admin' &&
        targetEmail !== session.email.toLowerCase()
      ) {
        res.status(403).json({ ok: false, error: 'Cannot view other employee scores.' });
        return;
      }

      const score = computePerformanceScore(
        tasks,
        { name: target.name, avatar: target.avatar, email: target.email || session.email, role: target.role },
        start,
        end
      );
      res.json({ ok: true, period, score });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.get('/progress-logs', requireAuth, async (_req, res) => {
    try {
      const logs = await getDb().collection('progress_logs').find({}).toArray();
      res.json({ ok: true, logs: logs.map((l) => stripMongoId(l)) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/progress-logs', requireAuth, async (req, res) => {
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

  router.get('/chat-channels', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const email = req.session!.email.trim().toLowerCase();
      const role = req.session!.role;

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

  router.post('/chat-channels', requireAuth, requireAdmin, async (req: AuthedRequest, res: Response) => {
    try {
      let { name, description, memberEmails } = req.body as {
        name?: string;
        description?: string;
        memberEmails?: string[];
      };
      const email = req.session!.email;
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

  router.put('/chat-channels/:channel/members', requireAuth, requireAdmin, async (req: AuthedRequest, res: Response) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
      const { memberEmails } = req.body as { memberEmails?: string[] };
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

  router.delete('/chat-channels/:channel/members/:email', requireAuth, requireAdmin, async (req, res) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
      const memberEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
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

  router.delete('/chat-channels/:channel', requireAuth, requireAdmin, async (req, res) => {
    try {
      const channelName = decodeURIComponent(req.params.channel);
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

  router.get('/chat/:channel', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const email = req.session!.email;
      const role = req.session!.role;
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

  router.post('/chat/:channel', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const text = String(req.body.text || '').trim();
      const role = req.session!.role;
      const sender = req.body.sender as { email?: string; name?: string } | undefined;
      const email = req.session!.email;

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
        timestamp: formatTimeIST(),
        reactions: {} as Record<string, string[]>,
        createdAt: new Date()
      };
      await getDb().collection('chat_messages').insertOne(msg);
      res.json({ ok: true, message: stripMongoId(msg) });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/chat/:channel/:messageId/react', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const channel = decodeURIComponent(req.params.channel);
      const messageId = req.params.messageId;
      const { emoji, userKey } = req.body as {
        emoji?: string;
        userKey?: string;
      };
      const email = req.session!.email;
      const role = req.session!.role;
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

  router.get('/schedule-exceptions', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const docs = await getDb().collection('schedule_exceptions').find({}).toArray();
      res.json({
        ok: true,
        exceptions: docs.map((d) => {
          const { _id, ...rest } = d as Record<string, unknown> & { _id: unknown };
          void _id;
          return rest;
        })
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.post('/schedule-exceptions', requireAuth, requireAdmin, async (req: AuthedRequest, res: Response) => {
    try {
      const { email, startHour, endHour } = req.body as { email?: string; startHour?: number; endHour?: number };
      if (!email?.trim() || startHour == null || endHour == null) {
        res.status(400).json({ ok: false, error: 'email, startHour, endHour required' });
        return;
      }
      const doc = {
        id: `sched-${Date.now()}`,
        email: email.trim().toLowerCase(),
        startHour: Number(startHour),
        endHour: Number(endHour),
        workDays: [1, 2, 3, 4, 5, 6],
        timezone: 'Asia/Kolkata',
        createdAt: new Date()
      };
      await getDb().collection('schedule_exceptions').insertOne(doc);
      res.json({ ok: true, exception: doc });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  router.delete('/schedule-exceptions/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      await getDb().collection('schedule_exceptions').deleteOne({ id: req.params.id });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  return router;
}
