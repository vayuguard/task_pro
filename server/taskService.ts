import type { Task, TaskStatus, StatusTimeSegment, User, Activity } from '../src/types.ts';
import { businessMsBetween, DEFAULT_SCHEDULE, type WorkSchedule } from './businessTime.ts';
import {
  getWallWorkingHours,
  getWorkingHours,
  getTaskPerformance,
  ensureTaskTiming
} from '../src/utils/taskTiming.ts';
import { nowTimestamp } from '../src/utils/time.ts';
import { scheduleForEmail, type ScheduleExceptionDoc } from './scheduleExceptions.ts';

export const STATUS_BOARD_LABEL: Record<TaskStatus, string> = {
  'To Do': 'Backlog',
  'In Progress': 'In Motion',
  Review: 'Check It',
  Done: 'Done'
};

function segmentWallMs(segment: StatusTimeSegment, now: Date): number {
  if (segment.endedAt) {
    return Math.max(
      0,
      segment.durationMs ??
        new Date(segment.endedAt).getTime() - new Date(segment.startedAt).getTime()
    );
  }
  return Math.max(0, now.getTime() - new Date(segment.startedAt).getTime());
}

function segmentBusinessMs(
  segment: StatusTimeSegment,
  now: Date,
  schedule: WorkSchedule = DEFAULT_SCHEDULE,
  holidays: Set<string> = new Set()
): number {
  const end = segment.endedAt ? new Date(segment.endedAt) : now;
  const start = new Date(segment.startedAt);
  if (segment.status !== 'In Progress') return 0;
  return businessMsBetween(start, end, schedule, holidays);
}

function resolveSegmentSchedule(
  segment: StatusTimeSegment,
  exceptions: ScheduleExceptionDoc[]
): WorkSchedule {
  if (!segment.assigneeEmail) return DEFAULT_SCHEDULE;
  return scheduleForEmail(segment.assigneeEmail, exceptions);
}

export function getCertifiedWorkingHours(
  task: Task,
  now: Date = new Date(),
  exceptions: ScheduleExceptionDoc[] = [],
  holidays: Set<string> = new Set()
): number {
  const history = task.statusHistory || [];
  const ms = history
    .filter((s) => s.status === 'In Progress')
    .reduce((sum, s) => {
      const schedule = resolveSegmentSchedule(s, exceptions);
      if (task.timerPaused && !s.endedAt) return sum;
      if (task.timingTrust === 'certified' && s.businessDurationMs != null) {
        if (!s.endedAt && s.status === task.status && task.status === 'In Progress') {
          return sum + segmentBusinessMs(s, now, schedule, holidays);
        }
        return sum + s.businessDurationMs;
      }
      return sum + segmentBusinessMs(s, now, schedule, holidays);
    }, 0);
  return Math.round((ms / 3_600_000) * 100) / 100;
}

export function transitionTaskOnServer(
  task: Task,
  nextStatus: TaskStatus,
  actor: User,
  at: Date = new Date(),
  exceptions: ScheduleExceptionDoc[] = []
): Task {
  const ensured = ensureTaskTiming(task, at);
  if (ensured.status === nextStatus) {
    return { ...ensured, timeLogged: getWorkingHours(ensured, at) };
  }

  const history = [...(ensured.statusHistory || [])];
  const assigneeEmail = (ensured.assignee.email || '').toLowerCase();
  const openIdx = history.length - 1;

  if (openIdx >= 0 && !history[openIdx].endedAt) {
    const open = history[openIdx];
    const wallMs = Math.max(0, at.getTime() - new Date(open.startedAt).getTime());
    const openSchedule = resolveSegmentSchedule(open, exceptions);
    const bizMs =
      open.status === 'In Progress'
        ? businessMsBetween(new Date(open.startedAt), at, openSchedule)
        : 0;
    history[openIdx] = {
      ...open,
      endedAt: at.toISOString(),
      durationMs: wallMs,
      businessDurationMs: bizMs,
      assigneeEmail: open.assigneeEmail || assigneeEmail
    };
  }

  history.push({
    status: nextStatus,
    startedAt: at.toISOString(),
    durationMs: 0,
    assigneeEmail,
    businessDurationMs: 0
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

  const timeLogged = getWorkingHours({ ...ensured, statusHistory: history, status: nextStatus }, at);

  const estimateLockedAt =
    nextStatus === 'In Progress' && !ensured.estimateLockedAt ? at.toISOString() : ensured.estimateLockedAt;

  const timingTrust: Task['timingTrust'] =
    ensured.timingTrust === 'certified' ? 'certified' : nextStatus === 'In Progress' ? 'certified' : ensured.timingTrust || 'legacy';

  const perf =
    nextStatus === 'Done'
      ? getTaskPerformance({ ...ensured, status: nextStatus, statusHistory: history, timeLogged }, at)
      : null;

  if (perf && nextStatus === 'Done') {
    log.content += ` · spent ${perf.spent}h of ${perf.estimated}h planned (${perf.label}${
      perf.efficiencyPct != null ? `, ${perf.efficiencyPct}% efficiency` : ''
    })`;
  }

  return {
    ...ensured,
    status: nextStatus,
    statusHistory: history,
    timerPaused: false,
    timeLogged,
    estimateLockedAt,
    timingTrust,
    completedAt: nextStatus === 'Done' ? at.toISOString() : undefined,
    activity: [log, ...ensured.activity],
    version: (ensured.version || 0) + 1
  };
}

export function pauseWorkTimer(
  task: Task,
  actor: User,
  at: Date = new Date(),
  exceptions: ScheduleExceptionDoc[] = []
): Task {
  const ensured = ensureTaskTiming(task, at);
  if (ensured.status !== 'In Progress') return ensured;
  if (ensured.timerPaused) return ensured;

  const history = [...(ensured.statusHistory || [])];
  const openIdx = history.length - 1;
  if (openIdx >= 0 && !history[openIdx].endedAt) {
    const open = history[openIdx];
    const wallMs = Math.max(0, at.getTime() - new Date(open.startedAt).getTime());
    const openSchedule = resolveSegmentSchedule(open, exceptions);
    const bizMs =
      open.status === 'In Progress'
        ? businessMsBetween(new Date(open.startedAt), at, openSchedule)
        : 0;
    history[openIdx] = {
      ...open,
      endedAt: at.toISOString(),
      durationMs: wallMs,
      businessDurationMs: bizMs,
      assigneeEmail: open.assigneeEmail || (ensured.assignee.email || '').toLowerCase()
    };
  }

  const log: Activity = {
    id: `act-log-${at.getTime()}`,
    type: 'log',
    user: actor,
    content: 'paused the work timer — task stays In Progress',
    timestamp: nowTimestamp(at)
  };

  const next = { ...ensured, statusHistory: history, timerPaused: true };
  return {
    ...next,
    timeLogged: getWorkingHours(next, at),
    activity: [log, ...ensured.activity],
    version: (ensured.version || 0) + 1
  };
}

export function resumeWorkTimer(
  task: Task,
  actor: User,
  at: Date = new Date()
): Task {
  const ensured = ensureTaskTiming(task, at);
  if (ensured.status !== 'In Progress') return ensured;
  if (!ensured.timerPaused) return ensured;

  const history = [...(ensured.statusHistory || [])];
  history.push({
    status: 'In Progress',
    startedAt: at.toISOString(),
    durationMs: 0,
    assigneeEmail: (ensured.assignee.email || '').toLowerCase(),
    businessDurationMs: 0
  });

  const log: Activity = {
    id: `act-log-${at.getTime()}`,
    type: 'log',
    user: actor,
    content: 'resumed the work timer',
    timestamp: nowTimestamp(at)
  };

  const next = { ...ensured, statusHistory: history, timerPaused: false };
  return {
    ...next,
    timeLogged: getWorkingHours(next, at),
    activity: [log, ...ensured.activity],
    version: (ensured.version || 0) + 1
  };
}

export function markLegacyTasks(tasks: Task[]): Task[] {
  return tasks.map((t) => enrichTaskForClient({ ...t, timingTrust: t.timingTrust || 'legacy', version: t.version || 0 }));
}

export function enrichTaskForClient(
  task: Task,
  now: Date = new Date(),
  exceptions: ScheduleExceptionDoc[] = [],
  holidays: Set<string> = new Set()
): Task {
  const wall = getWallWorkingHours(task, now);
  const business = getCertifiedWorkingHours(task, now, exceptions, holidays);
  return { ...task, timeLogged: wall, timeLoggedWall: wall, timeLoggedBusiness: business };
}

/** Split open timing segment when assignee changes so prior worker keeps credit. */
export function reassignTask(
  task: Task,
  newAssignee: User,
  at: Date = new Date(),
  exceptions: ScheduleExceptionDoc[] = []
): Task {
  const oldEmail = (task.assignee.email || '').toLowerCase();
  const newEmail = (newAssignee.email || '').toLowerCase();
  if (!newEmail || oldEmail === newEmail) {
    return { ...task, assignee: newAssignee };
  }

  const history = [...(task.statusHistory || [])];
  const openIdx = history.length - 1;
  if (openIdx >= 0 && !history[openIdx].endedAt) {
    const open = history[openIdx];
    const wallMs = Math.max(0, at.getTime() - new Date(open.startedAt).getTime());
    const openSchedule = resolveSegmentSchedule(open, exceptions);
    const bizMs =
      open.status === 'In Progress'
        ? businessMsBetween(new Date(open.startedAt), at, openSchedule)
        : 0;
    history[openIdx] = {
      ...open,
      endedAt: at.toISOString(),
      durationMs: wallMs,
      businessDurationMs: bizMs,
      assigneeEmail: open.assigneeEmail || oldEmail
    };
    history.push({
      status: task.status,
      startedAt: at.toISOString(),
      durationMs: 0,
      assigneeEmail: newEmail,
      businessDurationMs: 0
    });
  }

  return {
    ...task,
    assignee: newAssignee,
    statusHistory: history,
    version: (task.version || 0) + 1
  };
}
