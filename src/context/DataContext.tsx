import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Holiday, Task, User, ProjectHealth } from '../types';
import {
  apiBootstrap,
  apiCreateTask,
  apiUpdateTask,
  apiTransitionTask,
  apiPauseTimer,
  apiResumeTimer,
  apiReviewTask,
  apiDeleteTask
} from '../api/client';
import { normalizeTasks } from '../utils/tasks';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastContext';
import type { TaskStatus } from '../types';
import { celebrate } from '../utils/celebrate';

function snapshot(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function setIfChanged<T>(setter: React.Dispatch<React.SetStateAction<T>>, next: T) {
  setter((prev) => (snapshot(prev) === snapshot(next) ? prev : next));
}

/** Live hour fields are recomputed on every fetch; ignore them so timers don't rebuild the page. */
function taskCore(task: Task) {
  const { timeLogged, timeLoggedWall, timeLoggedBusiness, ...rest } = task as Task & {
    timeLoggedWall?: number;
    timeLoggedBusiness?: number;
  };
  return rest;
}

function mergeTasks(prev: Task[], next: Task[]): Task[] {
  const prevById = new Map(prev.map((t) => [t.id, t]));
  const merged = next.map((incoming) => {
    const existing = prevById.get(incoming.id);
    if (!existing) return incoming;
    return snapshot(taskCore(existing)) === snapshot(taskCore(incoming)) ? existing : incoming;
  });
  if (merged.length === prev.length && merged.every((t, i) => t === prev[i])) return prev;
  return merged;
}

interface DataContextValue {
  tasks: Task[];
  teamMembers: User[];
  projectsHealth: ProjectHealth[];
  holidays: Holiday[];
  holidayDates: Set<string>;
  loading: boolean;
  error: string;
  reload: (opts?: { busy?: boolean }) => Promise<void>;
  updateTask: (task: Task, meta?: { estimateReason?: string }) => Promise<Task>;
  transitionTask: (taskId: string, status: TaskStatus, version?: number) => Promise<Task>;
  pauseTimer: (taskId: string) => Promise<Task>;
  resumeTimer: (taskId: string) => Promise<Task>;
  reviewTask: (taskId: string, outcome: 'accepted' | 'changes_requested') => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
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
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const reload = useCallback(async (opts?: { busy?: boolean }) => {
    if (!isLoggedIn) return;
    const busy = Boolean(opts?.busy);
    if (busy) {
      setLoading(true);
      setError('');
    }
    try {
      const data = await apiBootstrap();
      const nextTasks = normalizeTasks(data.tasks).filter((t) => !t.archivedAt);
      setTasks((prev) => mergeTasks(prev, nextTasks));
      setIfChanged(setTeamMembers, data.teamMembers || []);
      setIfChanged(setProjectsHealth, data.projectsHealth || []);
      setIfChanged(setHolidays, data.holidays || []);
      if (busy) setError('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data';
      if (busy) {
        setError(msg);
        toastRef.current(msg, 'error');
      }
    } finally {
      if (busy) setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (isLoggedIn) {
      void reload({ busy: true });
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
      void reload({ busy: false });
    }, 90_000);

    return () => {
      window.clearInterval(pollId);
    };
  }, [authLoading, isLoggedIn, reload]);

  const replaceTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === task.id ? task : t));
      return next.every((t, i) => t === prev[i]) ? prev : next;
    });
  }, []);

  const replaceTasks = useCallback((next: Task[]) => {
    if (next.length === 0) return;
    const byId = new Map(next.map((t) => [t.id, t]));
    setTasks((prev) => {
      const merged = prev.map((t) => byId.get(t.id) ?? t);
      return merged.every((t, i) => t === prev[i]) ? prev : merged;
    });
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

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        await apiDeleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast('Task deleted', 'success');
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Delete failed', 'error');
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

  const value = useMemo(
    () => ({
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
      deleteTask,
      addTask,
      visibleTasks
    }),
    [
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
      deleteTask,
      addTask,
      visibleTasks
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData requires DataProvider');
  return ctx;
}
