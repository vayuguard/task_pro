export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  added: string;
  type: 'pdf' | 'image' | 'doc';
  url?: string;
}

export interface User {
  name: string;
  avatar: string;
  role?: string;
  email?: string;
}

export type UserRole = 'admin' | 'employee';

export interface Activity {
  id: string;
  type: 'comment' | 'log';
  user: User;
  content: string;
  timestamp: string;
  likes?: number;
}

export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';

/** Time spent in one Kanban section (open segment has no endedAt). */
export interface StatusTimeSegment {
  status: TaskStatus;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  /** Who was assignee during this segment */
  assigneeEmail?: string;
  /** Certified business-time ms (In Motion only) */
  businessDurationMs?: number;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  assignee: User;
  reporter: User;
  createdDate: string;
  dueDate: string;
  labels: string[];
  /** Auto: hours spent in In Progress (wall clock, legacy). */
  timeLogged: number;
  /** Certified business hours (server). */
  timeLoggedBusiness?: number;
  /** Wall-clock In Motion hours (server). */
  timeLoggedWall?: number;
  timeEstimated: number;
  /** ISO — when task was created/assigned (timer not started yet). */
  assignedAt?: string;
  /** ISO — when moved to Done. */
  completedAt?: string;
  /** Full record of time in each section. */
  statusHistory?: StatusTimeSegment[];
  /** legacy = unverified backfill; certified = server-tracked transitions */
  timingTrust?: 'legacy' | 'certified';
  /** ISO — estimate frozen when work first enters In Motion */
  estimateLockedAt?: string;
  /** Optimistic concurrency */
  version?: number;
  /** Review outcome for quality scoring */
  reviewOutcome?: 'accepted' | 'changes_requested';
  /** Display only — office / wfh / hybrid */
  workMode?: 'office' | 'wfh' | 'hybrid';
  /** In Progress but clock closed until resume */
  timerPaused?: boolean;
  /** Soft-delete timestamp (ISO). Hidden from boards when set. */
  archivedAt?: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  activity: Activity[];
}

export type ActiveScreen =
  | 'admin-dashboard'
  | 'employee-dashboard'
  | 'kanban-board'
  | 'task-details'
  | 'performance'
  | 'team-chat'
  | 'settings';

export interface EmployeeMetrics {
  id: string;
  name: string;
  role: string;
  avatar: string;
  velocity: number;
  completionRate: number;
  feedbackScore: number;
  trend: number;
  tasksCompleted: number;
  kudos: number;
}

export interface ProgressLog {
  id: string;
  taskId: string;
  taskTitle: string;
  hours: number;
  notes: string;
  timestamp: string;
  author: string;
}

export interface ProjectHealth {
  name: string;
  health: number;
  velocity: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}
