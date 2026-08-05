import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Task, User, ProjectHealth } from '../types';
import { apiBootstrap, apiCreateTask, apiUpdateTask, apiTransitionTask } from '../api/client';
import { normalizeTasks } from '../utils/tasks';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastContext';
import type { TaskStatus } from '../types';
import { celebrate } from '../utils/celebrate';

interface DataContextValue {
  tasks: Task[];
  teamMembers: User[];
  projectsHealth: ProjectHealth[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  updateTask: (task: Task, meta?: { estimateReason?: string }) => Promise<Task>;
  transitionTask: (taskId: string, status: TaskStatus, version?: number) => Promise<Task>;
  addTask: (task: Task) => Promise<Task>;
  visibleTasks: Task[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [projectsHealth, setProjectsHealth] = useState<ProjectHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiBootstrap();
      setTasks(normalizeTasks(data.tasks));
      setTeamMembers(data.teamMembers || []);
      setProjectsHealth(data.projectsHealth || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, toast]);

  useEffect(() => {
    if (isLoggedIn) void reload();
    else {
      setTasks([]);
      setLoading(false);
    }
  }, [isLoggedIn, session?.userId, reload]);

  const updateTask = useCallback(
    async (task: Task, meta?: { estimateReason?: string }) => {
      try {
        const res = await apiUpdateTask(task, meta);
        setTasks((prev) => prev.map((t) => (t.id === res.task.id ? res.task : t)));
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Save failed', 'error');
        throw err;
      }
    },
    [toast]
  );

  const transitionTask = useCallback(
    async (taskId: string, status: TaskStatus, version?: number) => {
      try {
        const res = await apiTransitionTask(taskId, status, version);
        setTasks((prev) => prev.map((t) => (t.id === res.task.id ? res.task : t)));
        if (res.task.status === 'Done') celebrate(44);
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Status update failed', 'error');
        throw err;
      }
    },
    [toast]
  );

  const addTask = useCallback(
    async (task: Task) => {
      try {
        const res = await apiCreateTask(task);
        setTasks((prev) => [res.task, ...prev]);
        toast('Task created', 'success');
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Create failed', 'error');
        throw err;
      }
    },
    [toast]
  );

  const isAdmin = session?.role === 'admin';
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter(
        (t) =>
          t.assignee.email?.toLowerCase() === session?.email.toLowerCase() ||
          t.assignee.name === session?.profile.name
      );

  return (
    <DataContext.Provider
      value={{
        tasks,
        teamMembers,
        projectsHealth,
        loading,
        error,
        reload,
        updateTask,
        transitionTask,
        addTask,
        visibleTasks
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData requires DataProvider');
  return ctx;
}
