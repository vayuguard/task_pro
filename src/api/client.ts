import { Task, EmployeeMetrics, ProgressLog, ProjectHealth, User } from '../types';
import { AuthSession } from '../auth/auth';

const API = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export interface BootstrapData {
  tasks: Task[];
  employees: EmployeeMetrics[];
  progressLogs: ProgressLog[];
  projectsHealth: ProjectHealth[];
  teamMembers: User[];
  channels: { name: string; description: string; unread: boolean }[];
}

export async function apiHealth(): Promise<{ ok: boolean; database: string }> {
  return request('/health');
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ ok: true; session: AuthSession; mfaRequired: boolean }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function apiVerifyMfa(
  email: string,
  code: string
): Promise<{ ok: true; session: AuthSession }> {
  return request('/auth/mfa', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

export async function apiBootstrap(): Promise<BootstrapData & { ok: true }> {
  return request('/bootstrap');
}

export async function apiCreateTask(task: Task): Promise<{ ok: true; task: Task }> {
  return request('/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export async function apiUpdateTask(task: Task): Promise<{ ok: true; task: Task }> {
  return request(`/tasks/${encodeURIComponent(task.id)}`, {
    method: 'PUT',
    body: JSON.stringify(task)
  });
}

export async function apiCreateProgressLog(
  log: ProgressLog
): Promise<{ ok: true; log: ProgressLog }> {
  return request('/progress-logs', { method: 'POST', body: JSON.stringify(log) });
}

export async function apiGetChatMessages(
  channel: string,
  email: string,
  role: string
): Promise<{ ok: true; messages: ChatMessageDto[] }> {
  const q = new URLSearchParams({ email, role });
  return request(`/chat/${encodeURIComponent(channel)}?${q}`);
}

export interface ChatMessageDto {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
  reactions?: Record<string, string[]>;
  createdAt?: string;
}

export interface ChatChannelDto {
  name: string;
  description: string;
  unread?: boolean;
  messageCount?: number;
  memberEmails?: string[];
}

export async function apiSendChatMessage(
  channel: string,
  sender: User,
  text: string,
  role: string
): Promise<{ ok: true; message: ChatMessageDto }> {
  return request(`/chat/${encodeURIComponent(channel)}`, {
    method: 'POST',
    body: JSON.stringify({ sender, text, role, email: sender.email })
  });
}

export async function apiListChannels(
  email: string,
  role: string
): Promise<{ ok: true; channels: ChatChannelDto[] }> {
  const q = new URLSearchParams({ email, role });
  return request(`/chat-channels?${q}`);
}

export async function apiCreateChannel(payload: {
  name: string;
  description?: string;
  memberEmails?: string[];
  email: string;
  role: string;
}): Promise<{ ok: true; channel: ChatChannelDto }> {
  return request('/chat-channels', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function apiUpdateChannelMembers(
  channel: string,
  memberEmails: string[],
  role: string
): Promise<{ ok: true; channel: ChatChannelDto }> {
  return request(`/chat-channels/${encodeURIComponent(channel)}/members`, {
    method: 'PUT',
    body: JSON.stringify({ memberEmails, role })
  });
}

export async function apiRemoveChannelMember(
  channel: string,
  memberEmail: string,
  role: string
): Promise<{ ok: true; channel: ChatChannelDto }> {
  const q = new URLSearchParams({ role });
  return request(
    `/chat-channels/${encodeURIComponent(channel)}/members/${encodeURIComponent(memberEmail)}?${q}`,
    { method: 'DELETE' }
  );
}

export async function apiDeleteChannel(
  channel: string,
  role: string
): Promise<{ ok: true; deleted: string }> {
  const q = new URLSearchParams({ role });
  return request(`/chat-channels/${encodeURIComponent(channel)}?${q}`, {
    method: 'DELETE'
  });
}

export async function apiReactToMessage(
  channel: string,
  messageId: string,
  emoji: string,
  userKey: string,
  email: string,
  role: string
): Promise<{ ok: true; message: ChatMessageDto }> {
  return request(`/chat/${encodeURIComponent(channel)}/${encodeURIComponent(messageId)}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji, userKey, email, role })
  });
}

export async function apiListEmployees(): Promise<{
  ok: true;
  employees: Array<{ id: string; email: string; role: string; profile: User }>;
}> {
  return request('/employees');
}

export async function apiCreateEmployee(payload: {
  name: string;
  email: string;
  password: string;
  jobTitle?: string;
  createdBy?: string;
}): Promise<{
  ok: true;
  employee: { id: string; email: string; role: string; profile: User };
  emailDelivery: { sent: boolean; mode: 'smtp' | 'console'; preview?: string };
}> {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
