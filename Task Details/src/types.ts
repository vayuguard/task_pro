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

export interface Activity {
  id: string;
  type: 'comment' | 'log';
  user: User;
  content: string;
  timestamp: string;
  likes?: number;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
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
