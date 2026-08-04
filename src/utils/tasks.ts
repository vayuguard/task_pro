import { Task, TaskPriority, User, UserRole } from '../types';
import { TASK_PRIORITIES } from './priority';

const EMAIL_BY_NAME: Record<string, string> = {
  'Marcus Wright': 'marcus@taskpro.com',
  'Ritesh Prajapati': 'ritesh.prajapati@vayuguard.com',
  'Sarah Chen': 'ritesh.prajapati@vayuguard.com',
  'Alex River': 'alex@taskpro.com',
  'Jessica Lopez': 'jessica@taskpro.com'
};

const PRIORITY_ALIASES: Record<string, TaskPriority> = {
  highest: 'Highest',
  urgent: 'Highest',
  critical: 'Highest',
  high: 'High',
  medium: 'Medium',
  med: 'Medium',
  low: 'Low'
};

/** Match task to logged-in user by email first, then name */
export function isTaskAssignedToUser(task: Task, user: User): boolean {
  if (user.email && task.assignee.email) {
    return task.assignee.email.toLowerCase() === user.email.toLowerCase();
  }
  return task.assignee.name.trim().toLowerCase() === user.name.trim().toLowerCase();
}

export function getVisibleTasks(tasks: Task[], user: User, role: UserRole): Task[] {
  if (role === 'admin') return tasks;
  return tasks.filter((t) => isTaskAssignedToUser(t, user));
}

export function normalizePriority(priority: string | undefined): TaskPriority {
  if (!priority) return 'Medium';
  if ((TASK_PRIORITIES as string[]).includes(priority)) return priority as TaskPriority;
  return PRIORITY_ALIASES[priority.toLowerCase()] || 'Medium';
}

/** Ensure assignee has email and priority is one of the four levels */
export function normalizeTask(task: Task): Task {
  let next = task;

  const priority = normalizePriority(task.priority);
  if (priority !== task.priority) {
    next = { ...next, priority };
  }

  if (!next.assignee.email) {
    const email = EMAIL_BY_NAME[next.assignee.name];
    if (email) {
      next = { ...next, assignee: { ...next.assignee, email } };
    }
  }

  return next;
}

export function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map(normalizeTask);
}

export function enrichUserWithEmail(user: User): User {
  if (user.email) return user;
  const email = EMAIL_BY_NAME[user.name];
  return email ? { ...user, email } : user;
}

export function getMemberEmail(name: string): string | undefined {
  return EMAIL_BY_NAME[name];
}
