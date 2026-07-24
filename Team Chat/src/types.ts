export interface FileAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  fileAttachment?: FileAttachment;
  isSentByMe?: boolean;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  subtasks: Subtask[];
  comments: TaskComment[];
  timeSpent: number; // in seconds
}

export interface Channel {
  id: string;
  name: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  textStatus?: string;
}

export type ActiveView = 
  | 'admin-dashboard'
  | 'employee-dashboard'
  | 'kanban-board'
  | 'task-details'
  | 'performance'
  | 'team-chat';
