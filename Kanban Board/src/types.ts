export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "High" | "Medium" | "Low";
  category: "Product" | "Design" | "Dev" | "Marketing" | "Ops" | "Success";
  assigneeId: string;
  dueDate: string;
  completedDate?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  efficiency: number;
}

export interface ChatMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export type ViewType =
  | "dashboard"
  | "employee_dashboard"
  | "kanban"
  | "task_details"
  | "performance"
  | "chat";
