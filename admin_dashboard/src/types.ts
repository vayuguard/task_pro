export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DivisionType = 'Engineering' | 'Product' | 'Operations' | 'Marketing' | 'Security';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: string[]; // names of team members
  division: DivisionType;
  timeAgo: string;
  dateCreated: string;
  subtasks: SubTask[];
  comments: Comment[];
}

export interface Activity {
  id: string;
  type: 'upload_file' | 'chat' | 'warning' | 'task' | 'settings';
  title: string;
  project: string;
  user: string;
  userAvatar: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'ACTION REQUIRED';
  date: string;
}

export interface Channel {
  id: string;
  name: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  channelId: string;
  user: string;
  userRole: string;
  avatar: string;
  text: string;
  date: string;
}

export type TabType = 'admin_dashboard' | 'employee_dashboard' | 'kanban_board' | 'task_details' | 'performance' | 'team_chat';
