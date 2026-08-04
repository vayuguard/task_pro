/**
 * Smoke tests for auth + task visibility logic (no browser required).
 * Run: npm run test:smoke
 */
import { AUTH_ACCOUNTS, ADMIN_SEED, canAccessScreen, canAssignToOthers, canViewAllTasks, canManageEmployees, DEMO_MFA_CODE } from '../src/auth/auth.ts';
import { getVisibleTasks, isTaskAssignedToUser, normalizeTasks, enrichUserWithEmail, normalizePriority } from '../src/utils/tasks.ts';
import { TASK_PRIORITIES } from '../src/utils/priority.ts';
import { nowTimestamp } from '../src/utils/time.ts';
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
assert(ADMIN_SEED.email === 'ritesh.prajapati@vayuguard.com', 'admin email is ritesh.prajapati@vayuguard.com');
assert(DEMO_MFA_CODE === '123456', 'demo MFA code is 123456');

assert(canAccessScreen('admin', 'admin-dashboard'), 'admin can access dashboard');
assert(canAccessScreen('admin', 'performance'), 'admin can access performance');
assert(!canAccessScreen('employee', 'admin-dashboard'), 'employee blocked from admin dashboard');
assert(!canAccessScreen('employee', 'performance'), 'employee blocked from performance');
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

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
