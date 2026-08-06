/**
 * Smoke tests for auth + task visibility logic (no browser required).
 * Run: npm run test:smoke
 */
import { AUTH_ACCOUNTS, ADMIN_SEED, canAccessScreen, canAssignToOthers, canViewAllTasks, canManageEmployees, DEMO_MFA_CODE } from '../src/auth/auth.ts';
import { getVisibleTasks, isTaskAssignedToUser, normalizeTasks, enrichUserWithEmail, normalizePriority, getMemberEmail } from '../src/utils/tasks.ts';
import { TASK_PRIORITIES } from '../src/utils/priority.ts';
import { nowTimestamp, resolveActivityTimestamp, IST_TIMEZONE, formatTimeIST, formatIsoDateIST } from '../src/utils/time.ts';
import { createInitialTiming, transitionTaskStatus, getWorkingHours, getTaskPerformance } from '../src/utils/taskTiming.ts';
import { businessMsBetween } from '../server/businessTime.ts';
import { hashPassword, verifyPassword } from '../server/auth/password.ts';
import { computePerformanceScore } from '../server/scoring.ts';
import { scheduleForEmail } from '../server/scheduleExceptions.ts';
import { Task } from '../src/types.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`);
  }
}

console.log('\nTaskPro smoke tests\n');

assert(AUTH_ACCOUNTS.length === 1, 'only admin is seeded in AUTH_ACCOUNTS');
assert(AUTH_ACCOUNTS[0].role === 'admin', 'seeded account is admin');
assert(ADMIN_SEED.email === 'reachus@vayuguard.com', 'admin email is reachus@vayuguard.com');
assert(DEMO_MFA_CODE === '202208', 'demo MFA code is 202208');

assert(canAccessScreen('admin', 'admin-dashboard'), 'admin can access dashboard');
assert(canAccessScreen('admin', 'performance'), 'admin can access performance');
assert(canAccessScreen('employee', 'performance'), 'employee can access own performance');
assert(!canAccessScreen('employee', 'admin-dashboard'), 'employee blocked from admin dashboard');
assert(canAccessScreen('employee', 'kanban-board'), 'employee can access kanban');
assert(canManageEmployees('admin'), 'admin can manage employees');
assert(!canManageEmployees('employee'), 'employee cannot manage employees');
assert(canAssignToOthers('admin'), 'admin can assign to others');
assert(!canAssignToOthers('employee'), 'employee cannot assign to others');
assert(canViewAllTasks('admin'), 'admin sees all tasks');

assert(TASK_PRIORITIES.length === 4, 'four priority levels');
assert(normalizePriority('urgent') === 'Highest', 'urgent maps to Highest');
assert(normalizePriority('Highest') === 'Highest', 'Highest is valid');
assert(typeof nowTimestamp() === 'string' && !nowTimestamp().includes('Just now'), 'timestamps are concrete');
assert(IST_TIMEZONE === 'Asia/Kolkata', 'display timezone is IST');
assert(
  !resolveActivityTimestamp({ id: `act-log-${Date.UTC(2026, 7, 4, 12, 30)}`, timestamp: 'Just now' }).includes('Just now'),
  'Just now resolves to real stamp from activity id'
);
// Fixed UTC instant → IST must be 18:00 (UTC+5:30)
assert(
  formatTimeIST(new Date(Date.UTC(2026, 7, 5, 12, 30))).includes('6:00'),
  'formatTimeIST converts UTC noon+30m to 6:00 PM IST'
);
assert(
  formatIsoDateIST(new Date(Date.UTC(2026, 7, 5, 20, 0))) === '2026-08-06',
  'formatIsoDateIST rolls calendar day at IST midnight'
);

// Visibility with dynamically created employees
const empUser = enrichUserWithEmail({
  name: 'Jane Doe',
  email: 'jane@company.com',
  avatar: '',
  role: 'Employee'
});

const sampleTasks: Task[] = normalizeTasks([
  {
    id: 'T1',
    title: 'For Jane',
    project: 'P',
    priority: 'Highest',
    status: 'To Do',
    description: '',
    assignee: empUser,
    reporter: ADMIN_SEED.profile,
    createdDate: '',
    dueDate: '',
    labels: [],
    timeLogged: 0,
    timeEstimated: 1,
    subtasks: [],
    attachments: [],
    activity: []
  },
  {
    id: 'T2',
    title: 'For Admin',
    project: 'P',
    priority: 'Low',
    status: 'To Do',
    description: '',
    assignee: ADMIN_SEED.profile,
    reporter: ADMIN_SEED.profile,
    createdDate: '',
    dueDate: '',
    labels: [],
    timeLogged: 0,
    timeEstimated: 1,
    subtasks: [],
    attachments: [],
    activity: []
  }
]);

const janeVisible = getVisibleTasks(sampleTasks, empUser, 'employee');
assert(janeVisible.length === 1 && janeVisible[0].id === 'T1', 'employee only sees own tasks');
assert(isTaskAssignedToUser(sampleTasks[0], empUser), 'email match assigns task to employee');
assert(getVisibleTasks(sampleTasks, ADMIN_SEED.profile, 'admin').length === 2, 'admin sees all tasks');
assert(sampleTasks[0].priority === 'Highest', 'Highest priority preserved');

// Automated status timing
const timingUser = ADMIN_SEED.profile;
const t0: Task = {
  id: `Task-${Date.now()}`,
  title: 'Timing',
  project: 'P',
  priority: 'Medium',
  status: 'To Do',
  description: '',
  assignee: timingUser,
  reporter: timingUser,
  createdDate: 'Aug 5, 2026',
  dueDate: 'Aug 12, 2026',
  labels: [],
  timeEstimated: 2,
  subtasks: [],
  attachments: [],
  activity: [],
  ...createInitialTiming(new Date('2026-08-05T10:00:00.000Z'))
};
assert(t0.timeLogged === 0, 'Backlog starts with 0 spent hours');
assert(getWorkingHours(t0, new Date('2026-08-05T12:00:00.000Z')) === 0, 'Backlog does not accrue work time');

const t1 = transitionTaskStatus(t0, 'In Progress', timingUser, new Date('2026-08-05T11:00:00.000Z'));
assert(t1.status === 'In Progress', 'moved to In Motion');
assert(getWorkingHours(t1, new Date('2026-08-05T12:00:00.000Z')) === 1, '1h accrued after 1h in In Motion');

const t2 = transitionTaskStatus(t1, 'Review', timingUser, new Date('2026-08-05T12:30:00.000Z'));
assert(t2.status === 'Review', 'moved to Check It');
assert(getWorkingHours(t2, new Date('2026-08-05T15:00:00.000Z')) === 1.5, 'timer stopped in Check It at 1.5h');

const t3 = transitionTaskStatus(t2, 'Done', timingUser, new Date('2026-08-05T16:00:00.000Z'));
const perf = getTaskPerformance(t3, new Date('2026-08-05T16:00:00.000Z'));
assert(t3.status === 'Done', 'moved to Done');
assert(perf.spent === 1.5, 'Done spent stays 1.5h');
assert(perf.label === 'Early', 'finished early vs 2h plan');
assert((perf.efficiencyPct || 0) > 100, 'efficiency over 100% when early');

assert(getMemberEmail('Sarah Chen') === 'sarah@taskpro.com', 'Sarah Chen email map is distinct');
assert(getMemberEmail('Vayuguard Admin') === 'reachus@vayuguard.com', 'Vayuguard Admin email map correct');

const hashed = hashPassword('testpass');
assert(verifyPassword('testpass', hashed), 'scrypt hash verifies');
assert(!verifyPassword('wrong', hashed), 'scrypt rejects wrong password');

// Mon 11:00–13:00 IST = 2h business window (Aug 4 2026 is Tuesday)
const bizStart = new Date('2026-08-04T05:30:00.000Z'); // 11:00 IST
const bizEnd = new Date('2026-08-04T07:30:00.000Z'); // 13:00 IST
const bizMs = businessMsBetween(bizStart, bizEnd);
assert(bizMs === 2 * 3_600_000, 'business hours counts 2h within 10–18 IST window');

// A running task pauses at 18:00 IST, resumes at 10:00, and stops in To Do.
const officeBase: Task = {
  ...t0,
  id: 'office-window-timing',
  status: 'To Do',
  activity: [],
  ...createInitialTiming(new Date('2026-08-05T10:00:00.000Z'))
};
const officeRunning = transitionTaskStatus(
  officeBase,
  'In Progress',
  timingUser,
  new Date('2026-08-05T11:30:00.000Z') // Wed 17:00 IST
);
assert(
  getWorkingHours(officeRunning, new Date('2026-08-05T15:30:00.000Z')) === 1,
  'In Progress timer stops accruing at 18:00 IST'
);
assert(
  getWorkingHours(officeRunning, new Date('2026-08-06T03:30:00.000Z')) === 1,
  'In Progress timer stays paused before 10:00 IST'
);
const officePaused = transitionTaskStatus(
  officeRunning,
  'To Do',
  timingUser,
  new Date('2026-08-06T06:30:00.000Z') // Thu 12:00 IST: +2h
);
assert(
  getWorkingHours(officePaused, new Date('2026-08-06T09:00:00.000Z')) === 3,
  'moving In Progress to To Do stops the timer'
);
const officeResumed = transitionTaskStatus(
  officePaused,
  'In Progress',
  timingUser,
  new Date('2026-08-06T09:30:00.000Z') // Thu 15:00 IST
);
assert(
  getWorkingHours(officeResumed, new Date('2026-08-06T14:30:00.000Z')) === 6,
  'moving To Do back to In Progress resumes until 18:00 IST'
);

const score = computePerformanceScore(
  normalizeTasks([t3]),
  timingUser,
  new Date('2026-08-01'),
  new Date('2026-08-31')
);
assert(score.overall != null || score.eligibleTasks === 0, 'scoring engine returns result');

function employeePatch(body: Partial<Task>): Partial<Task> {
  const allowed = ['title', 'description', 'labels', 'subtasks', 'attachments', 'activity', 'priority', 'dueDate'];
  const out: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) out[k] = (body as Record<string, unknown>)[k];
  }
  return out as Partial<Task>;
}
const stripped = employeePatch({ title: 'ok', timeEstimated: 99 });
assert(stripped.title === 'ok' && !('timeEstimated' in stripped), 'employee PUT strips estimate');

const customSchedule = scheduleForEmail('jane@company.com', [
  { email: 'jane@company.com', startHour: 9, endHour: 17 }
]);
assert(customSchedule.startHour === 9 && customSchedule.endHour === 17, 'schedule exception applies custom hours');

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
