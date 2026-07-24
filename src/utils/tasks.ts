import { Task, User, UserRole } from '../types';

const EMAIL_BY_NAME: Record<string, string> = {
  'Marcus Wright': 'marcus@taskpro.com',
  'Ritesh Prajapati': 'ritesh.prajapati@vayuguard.com',
  'Sarah Chen': 'ritesh.prajapati@vayuguard.com',
  'Alex River': 'alex@taskpro.com',
  'Jessica Lopez': 'jessica@taskpro.com'
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

/** Ensure assignee has email so employee matching works after admin assignment */
export function normalizeTask(task: Task): Task {
  if (task.assignee.email) return task;
  const email = EMAIL_BY_NAME[task.assignee.name];
  if (!email) return task;
  return {
    ...task,
    assignee: { ...task.assignee, email }
  };
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
