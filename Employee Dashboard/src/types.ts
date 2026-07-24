export type TaskPriority = 'urgent' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  dueTime?: string;
  files: number;
  commentsCount: number;
  assignees: string[]; // names of assignees or indices
  subtasks: SubTask[];
  comments: Comment[];
  category?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  active: boolean;
  kudos: number;
  efficiency: number;
  tasksCompleted: number;
}

export interface TeamUpdate {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  detail?: string;
  category: 'mention' | 'attachment' | 'approval' | 'system';
}

export interface ChatMessage {
  id: string;
  channel: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  timestamp: string;
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

export interface ProjectMetrics {
  id: string;
  name: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
  budget: string;
}
