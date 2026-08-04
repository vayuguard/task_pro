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
  timeLogged: number;
  timeEstimated: number;
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
