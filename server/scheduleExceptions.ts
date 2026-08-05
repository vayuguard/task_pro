import { DEFAULT_SCHEDULE, type WorkSchedule } from './businessTime.ts';

export interface ScheduleExceptionDoc {
  email: string;
  startHour: number;
  endHour: number;
  workDays?: number[];
}

export function scheduleForEmail(
  email: string,
  exceptions: ScheduleExceptionDoc[]
): WorkSchedule {
  const key = email.trim().toLowerCase();
  const ex = exceptions.find((e) => e.email.trim().toLowerCase() === key);
  if (!ex) return DEFAULT_SCHEDULE;
  return {
    ...DEFAULT_SCHEDULE,
    workDays: ex.workDays ?? DEFAULT_SCHEDULE.workDays,
    startHour: ex.startHour,
    endHour: ex.endHour
  };
}

export function buildScheduleMap(exceptions: ScheduleExceptionDoc[]): Map<string, WorkSchedule> {
  const map = new Map<string, WorkSchedule>();
  for (const ex of exceptions) {
    map.set(ex.email.trim().toLowerCase(), scheduleForEmail(ex.email, [ex]));
  }
  return map;
}
