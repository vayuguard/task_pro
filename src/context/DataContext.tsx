import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Holiday, Task, User, ProjectHealth } from '../types';
import {
  apiBootstrap,
  apiCreateTask,
  apiUpdateTask,
  apiTransitionTask,
  apiPauseTimer,
  apiResumeTimer,
  apiReviewTask,
  apiArchiveTask
} from '../api/client';
import { normalizeTasks } from '../utils/tasks';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastContext';
import type { TaskStatus } from '../types';
import { celebrate } from '../utils/celebrate';

interface DataContextValue {
  tasks: Task[];
  teamMembers: User[];
  projectsHealth: ProjectHealth[];
  holidays: Holiday[];
  holidayDates: Set<string>;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  updateTask: (task: Task, meta?: { estimateReason?: string }) => Promise<Task>;
  transitionTask: (taskId: string, status: TaskStatus, version?: number) => Promise<Task>;
  pauseTimer: (taskId: string) => Promise<Task>;
  resumeTimer: (taskId: string) => Promise<Task>;
  reviewTask: (taskId: string, outcome: 'accepted' | 'changes_requested') => Promise<Task>;
  archiveTask: (taskId: string) => Promise<void>;
  addTask: (task: Task) => Promise<Task>;
  visibleTasks: Task[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoggedIn, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [projectsHealth, setProjectsHealth] = useState<ProjectHealth[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiBootstrap();
      setTasks(normalizeTasks(data.tasks).filter((t) => !t.archivedAt));
      setTeamMembers(data.teamMembers || []);
      setProjectsHealth(data.projectsHealth || []);
      setHolidays(data.holidays || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, toast]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (isLoggedIn) {
      void reload();
    } else {
      setTasks([]);
      setTeamMembers([]);
      setProjectsHealth([]);
      setHolidays([]);
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, session?.userId, reload]);

  useEffect(() => {
    if (!isLoggedIn || authLoading) return;

    const pollId = window.setInterval(() => {
      void reload();
    }, 30_000);

    const onFocus = () => {
      void reload();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void reload();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authLoading, isLoggedIn, reload]);

  const replaceTask = useCallback((task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  }, []);

  const replaceTasks = useCallback((next: Task[]) => {
    if (next.length === 0) return;
    const byId = new Map(next.map((t) => [t.id, t]));
    setTasks((prev) => prev.map((t) => byId.get(t.id) ?? t));
  }, []);

  const updateTask = useCallback(
    async (task: Task, meta?: { estimateReason?: string }) => {
      try {
        const res = await apiUpdateTask(task, meta);
        replaceTask(res.task);
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Save failed', 'error');
        throw err;
      }
    },
    [replaceTask, toast]
  );

  const transitionTask = useCallback(
    async (taskId: string, status: TaskStatus, version?: number) => {
      try {
        const res = await apiTransitionTask(taskId, status, version);
        replaceTasks([res.task, ...(res.affected || [])]);
        if (res.task.status === 'Done') celebrate(44);
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Status update failed', 'error');
        throw err;
      }
    },
    [replaceTasks, toast]
  );

  const pauseTimer = useCallback(
    async (taskId: string) => {
      try {
        const res = await apiPauseTimer(taskId);
        replaceTasks([res.task, ...(res.affected || [])]);
        toast('Timer paused', 'success');
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Pause failed', 'error');
        throw err;
      }
    },
    [replaceTasks, toast]
  );

  const resumeTimer = useCallback(
    async (taskId: string) => {
      try {
        const res = await apiResumeTimer(taskId);
        replaceTasks([res.task, ...(res.affected || [])]);
        toast('Timer resumed', 'success');
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Resume failed', 'error');
        throw err;
      }
    },
    [replaceTasks, toast]
  );

  const reviewTask = useCallback(
    async (taskId: string, outcome: 'accepted' | 'changes_requested') => {
      try {
        const res = await apiReviewTask(taskId, outcome);
        replaceTasks([res.task, ...(res.affected || [])]);
        if (res.task.status === 'Done') celebrate(44);
        toast(outcome === 'accepted' ? 'Review accepted' : 'Changes requested', 'success');
        return res.task;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Review failed', 'error');
        throw err;
      }
    },
    [replaceTasks, toast]
  );

  const archiveTask = useCallback(
    async (taskId: string) => {
      try {
        await apiArchiveTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast('Task archived', 'success');
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Archive failed', 'error');
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
  const visibleTasks = useMemo(() => {
    const active = tasks.filter((t) => !t.archivedAt);
    if (isAdmin) return active;
    return active.filter(
      (t) =>
        t.assignee.email?.toLowerCase() === session?.email.toLowerCase() ||
        t.assignee.name === session?.profile.name
    );
  }, [isAdmin, session?.email, session?.profile.name, tasks]);

  const holidayDates = useMemo(() => new Set(holidays.map((h) => h.date)), [holidays]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        teamMembers,
        projectsHealth,
        holidays,
        holidayDates,
        loading,
        error,
        reload,
        updateTask,
        transitionTask,
        pauseTimer,
        resumeTimer,
        reviewTask,
        archiveTask,
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
