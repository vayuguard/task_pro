import { Activity, Task, TaskStatus, User } from '../types';
import { nowTimestamp, roundHours } from './time';

export const STATUS_BOARD_LABEL: Record<TaskStatus, string> = {
  'To Do': 'Backlog',
  'In Progress': 'In Motion',
  Review: 'Check It',
  Done: 'Done'
};

export function msToHours(ms: number): number {
  return roundHours(Math.max(0, ms) / 3_600_000);
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function segmentDurationMs(
  segment: { startedAt: string; endedAt?: string; durationMs?: number },
  now: Date
): number {
  if (segment.endedAt) {
    return Math.max(
      0,
      segment.durationMs ??
        new Date(segment.endedAt).getTime() - new Date(segment.startedAt).getTime()
    );
  }
  return Math.max(0, now.getTime() - new Date(segment.startedAt).getTime());
}

/** Sum time spent in a given status (includes live open segment). */
export function getSectionMs(task: Task, status: TaskStatus, now: Date = new Date()): number {
  const history = task.statusHistory || [];
  return history
    .filter((s) => s.status === status)
    .reduce((sum, s) => sum + segmentDurationMs(s, now), 0);
}

export function getSectionHours(task: Task, status: TaskStatus, now: Date = new Date()): number {
  return msToHours(getSectionMs(task, status, now));
}

/** Working time = time spent in In Progress (In Motion) only. */
export function getWorkingHours(task: Task, now: Date = new Date()): number {
  return getSectionHours(task, 'In Progress', now);
}

export function getWorkingMs(task: Task, now: Date = new Date()): number {
  return getSectionMs(task, 'In Progress', now);
}

export function isWorkTimerRunning(task: Task): boolean {
  return task.status === 'In Progress';
}

export type TaskPerformance = {
  spent: number;
  estimated: number;
  /** estimated/spent × 100 — over 100 means finished early / faster than plan */
  efficiencyPct: number | null;
  /** estimated − spent (positive = early) */
  earlyHours: number;
  label: 'Early' | 'On track' | 'Over plan' | 'Not started' | 'In progress';
};

export function getTaskPerformance(task: Task, now: Date = new Date()): TaskPerformance {
  const spent = getWorkingHours(task, now);
  const estimated = task.timeEstimated || 0;
  const earlyHours = roundHours(estimated - spent);

  if (spent <= 0 && task.status === 'To Do') {
    return { spent, estimated, efficiencyPct: null, earlyHours, label: 'Not started' };
  }
  if (task.status === 'In Progress') {
    const efficiencyPct =
      estimated > 0 && spent > 0 ? Math.round((estimated / spent) * 100) : null;
    return {
      spent,
      estimated,
      efficiencyPct,
      earlyHours,
      label: spent > estimated && estimated > 0 ? 'Over plan' : 'In progress'
    };
  }
  if (spent <= 0) {
    return { spent, estimated, efficiencyPct: null, earlyHours, label: 'Not started' };
  }
  const efficiencyPct = estimated > 0 ? Math.round((estimated / spent) * 100) : null;
  let label: TaskPerformance['label'] = 'On track';
  if (estimated > 0) {
    if (spent < estimated * 0.95) label = 'Early';
    else if (spent > estimated * 1.05) label = 'Over plan';
  }
  return { spent, estimated, efficiencyPct, earlyHours, label };
}

export function createInitialTiming(at: Date = new Date()): Pick<
  Task,
  'statusHistory' | 'timeLogged' | 'assignedAt' | 'completedAt'
> {
  const iso = at.toISOString();
  return {
    assignedAt: iso,
    completedAt: undefined,
    timeLogged: 0,
    statusHistory: [
      {
        status: 'To Do',
        startedAt: iso,
        durationMs: 0
      }
    ]
  };
}

/** Backfill timing for older tasks that lack statusHistory. */
export function ensureTaskTiming(task: Task, at: Date = new Date()): Task {
  if (task.statusHistory && task.statusHistory.length > 0) {
    return {
      ...task,
      timeLogged: getWorkingHours(task, at),
      assignedAt: task.assignedAt || task.statusHistory[0]?.startedAt || at.toISOString()
    };
  }

  const started =
    task.assignedAt ||
    (task.id.match(/(\d{12,})$/) ? new Date(Number(task.id.match(/(\d{12,})$/)![1])).toISOString() : at.toISOString());

  return {
    ...task,
    assignedAt: started,
    completedAt: task.status === 'Done' ? task.completedAt || at.toISOString() : task.completedAt,
    statusHistory: [
      {
        status: task.status,
        startedAt: started,
        durationMs: 0
      }
    ],
    timeLogged: task.status === 'In Progress' ? getWorkingHours(
      {
        ...task,
        statusHistory: [{ status: 'In Progress', startedAt: started, durationMs: 0 }]
      },
      at
    ) : task.timeLogged || 0
  };
}

export function syncWorkingHours(task: Task, now: Date = new Date()): Task {
  const ensured = ensureTaskTiming(task, now);
  const timeLogged = getWorkingHours(ensured, now);
  if (timeLogged === ensured.timeLogged) return ensured;
  return { ...ensured, timeLogged };
}

/**
 * Move a task to a new status and record section timing.
 * Work timer runs only while status is In Progress; stops on Review/Done/Backlog.
 */
export function transitionTaskStatus(
  task: Task,
  nextStatus: TaskStatus,
  actor: User,
  at: Date = new Date()
): Task {
  const ensured = ensureTaskTiming(task, at);
  if (ensured.status === nextStatus) {
    return syncWorkingHours(ensured, at);
  }

  const history = [...(ensured.statusHistory || [])];
  const openIdx = history.length - 1;
  if (openIdx >= 0 && !history[openIdx].endedAt) {
    const open = history[openIdx];
    const durationMs = Math.max(0, at.getTime() - new Date(open.startedAt).getTime());
    history[openIdx] = {
      ...open,
      endedAt: at.toISOString(),
      durationMs
    };
  }

  history.push({
    status: nextStatus,
    startedAt: at.toISOString(),
    durationMs: 0
  });

  const fromLabel = STATUS_BOARD_LABEL[ensured.status];
  const toLabel = STATUS_BOARD_LABEL[nextStatus];
  const workNote =
    nextStatus === 'In Progress'
      ? ' — work timer started'
      : ensured.status === 'In Progress'
        ? ' — work timer stopped'
        : '';

  const log: Activity = {
    id: `act-log-${at.getTime()}`,
    type: 'log',
    user: actor,
    content: `moved this task from "${fromLabel}" to "${toLabel}"${workNote}`,
    timestamp: nowTimestamp(at)
  };

  const timeLogged = msToHours(
    history
      .filter((s) => s.status === 'In Progress')
      .reduce((sum, s) => sum + segmentDurationMs(s, at), 0)
  );

  const perf =
    nextStatus === 'Done'
      ? getTaskPerformance(
          { ...ensured, status: nextStatus, statusHistory: history, timeLogged },
          at
        )
      : null;

  const doneExtra =
    nextStatus === 'Done' && perf
      ? ` · spent ${perf.spent}h of ${perf.estimated}h planned (${perf.label}${
          perf.efficiencyPct != null ? `, ${perf.efficiencyPct}% efficiency` : ''
        })`
      : '';

  if (doneExtra) {
    log.content += doneExtra;
  }

  return {
    ...ensured,
    status: nextStatus,
    statusHistory: history,
    timeLogged,
    completedAt: nextStatus === 'Done' ? at.toISOString() : undefined,
    activity: [log, ...ensured.activity]
  };
}

export function sectionBreakdown(task: Task, now: Date = new Date()) {
  const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
  return statuses.map((status) => {
    const ms = getSectionMs(task, status, now);
    return {
      status,
      label: STATUS_BOARD_LABEL[status],
      ms,
      hours: msToHours(ms),
      display: formatDuration(ms),
      active: task.status === status
    };
  });
}
