import { Task, EmployeeMetrics, ProgressLog, ProjectHealth, User, TaskStatus } from '../types';
import { AuthSession } from '../auth/auth';

const API = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
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

export interface PerformanceScoreDto {
  formulaVersion: string;
  periodStart: string;
  periodEnd: string;
  userId: string;
  userName: string;
  overall: number | null;
  confidence: 'low' | 'medium' | 'high';
  eligibleTasks: number;
  components: Array<{
    id: string;
    label: string;
    weight: number;
    score: number | null;
    detail: string;
  }>;
  disclaimer: string;
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

export async function apiLogout(): Promise<{ ok: true }> {
  return request('/auth/logout', { method: 'POST' });
}

export async function apiMe(): Promise<{ ok: true; session: AuthSession }> {
  return request('/auth/me');
}

export async function apiBootstrap(): Promise<BootstrapData & { ok: true }> {
  return request('/bootstrap');
}

export async function apiCreateTask(task: Task): Promise<{ ok: true; task: Task }> {
  return request('/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export async function apiUpdateTask(
  task: Task,
  meta?: { estimateReason?: string }
): Promise<{ ok: true; task: Task }> {
  return request(`/tasks/${encodeURIComponent(task.id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...task, ...meta })
  });
}

export async function apiTransitionTask(
  taskId: string,
  status: TaskStatus,
  expectedVersion?: number
): Promise<{ ok: true; task: Task }> {
  return request(`/tasks/${encodeURIComponent(taskId)}/transition`, {
    method: 'POST',
    body: JSON.stringify({ status, expectedVersion })
  });
}

export async function apiGetPerformance(
  period = '30d',
  userId?: string
): Promise<
  | { ok: true; period: string; score: PerformanceScoreDto }
  | { ok: true; period: string; scores: PerformanceScoreDto[] }
> {
  const q = new URLSearchParams({ period });
  if (userId) q.set('userId', userId);
  return request(`/performance?${q}`);
}

export async function apiGetChatMessages(
  channel: string
): Promise<{ ok: true; messages: ChatMessageDto[] }> {
  return request(`/chat/${encodeURIComponent(channel)}`);
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
  text: string
): Promise<{ ok: true; message: ChatMessageDto }> {
  return request(`/chat/${encodeURIComponent(channel)}`, {
    method: 'POST',
    body: JSON.stringify({ sender, text })
  });
}

export async function apiListChannels(): Promise<{ ok: true; channels: ChatChannelDto[] }> {
  return request('/chat-channels');
}

export async function apiCreateChannel(payload: {
  name: string;
  description?: string;
  memberEmails?: string[];
}): Promise<{ ok: true; channel: ChatChannelDto }> {
  return request('/chat-channels', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function apiUpdateChannelMembers(
  channel: string,
  memberEmails: string[]
): Promise<{ ok: true; channel: ChatChannelDto }> {
  return request(`/chat-channels/${encodeURIComponent(channel)}/members`, {
    method: 'PUT',
    body: JSON.stringify({ memberEmails })
  });
}

export async function apiRemoveChannelMember(
  channel: string,
  memberEmail: string
): Promise<{ ok: true; channel: ChatChannelDto }> {
  return request(
    `/chat-channels/${encodeURIComponent(channel)}/members/${encodeURIComponent(memberEmail)}`,
    { method: 'DELETE' }
  );
}

export async function apiDeleteChannel(channel: string): Promise<{ ok: true; deleted: string }> {
  return request(`/chat-channels/${encodeURIComponent(channel)}`, {
    method: 'DELETE'
  });
}

export async function apiReactToMessage(
  channel: string,
  messageId: string,
  emoji: string,
  userKey: string
): Promise<{ ok: true; message: ChatMessageDto }> {
  return request(`/chat/${encodeURIComponent(channel)}/${encodeURIComponent(messageId)}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji, userKey })
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

export async function apiDeleteEmployee(
  employeeId: string
): Promise<{ ok: true; deleted: string; email: string | null }> {
  return request(`/employees/${encodeURIComponent(employeeId)}`, {
    method: 'DELETE'
  });
}

export interface ScheduleExceptionDto {
  id: string;
  email: string;
  startHour: number;
  endHour: number;
  workDays?: number[];
  timezone?: string;
}

export async function apiListScheduleExceptions(): Promise<{ ok: true; exceptions: ScheduleExceptionDto[] }> {
  return request('/schedule-exceptions');
}

export async function apiCreateScheduleException(payload: {
  email: string;
  startHour: number;
  endHour: number;
}): Promise<{ ok: true; exception: ScheduleExceptionDto }> {
  return request('/schedule-exceptions', { method: 'POST', body: JSON.stringify(payload) });
}

export async function apiDeleteScheduleException(id: string): Promise<{ ok: true }> {
  return request(`/schedule-exceptions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
