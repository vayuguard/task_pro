export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'on_track' | 'delayed' | 'active';

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  avatarBg: string; // Tailwind class for background
  velocity: number; // pts/wk
  completionRate: number; // percentage
  feedbackScore: number; // out of 5 stars
  trend: number; // percentage change, e.g. 4.1 or -0.4
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorInitials?: string;
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  points: number;
  comments: Comment[];
  category: string;
}

export interface ProjectHealth {
  id: string;
  name: string;
  status: ProjectStatus;
  percentage: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials?: string;
  senderBg?: string;
  text: string;
  timestamp: string;
  channel: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: string;
  type: 'task_created' | 'task_updated' | 'comment_added' | 'status_changed';
}
