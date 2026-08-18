import type { Task } from '../src/types.ts';
import { businessMsBetween, DEFAULT_SCHEDULE } from './businessTime.ts';
import { scheduleForEmail, type ScheduleExceptionDoc } from './scheduleExceptions.ts';
import { formatIsoDateIST } from '../src/utils/time.ts';

export interface TimesheetRow {
  date: string;
  email: string;
  name: string;
  hours: number;
  tasks: Array<{ id: string; title: string; hours: number }>;
}

function startOfIstDayUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00+05:30`);
}

function addIstDays(isoDate: string, days: number): string {
  const d = startOfIstDayUtc(isoDate);
  return formatIsoDateIST(new Date(d.getTime() + days * 86_400_000));
}

export function buildTimesheet(
  tasks: Task[],
  fromDate: string,
  toDate: string,
  exceptions: ScheduleExceptionDoc[] = [],
  holidays: Set<string> = new Set(),
  emailFilter?: string
): TimesheetRow[] {
  const byKey = new Map<string, TimesheetRow>();
  const filter = emailFilter?.trim().toLowerCase();

  for (const task of tasks) {
    if (task.archivedAt) continue;
    for (const segment of task.statusHistory || []) {
      if (segment.status !== 'In Progress') continue;
      const start = new Date(segment.startedAt);
      const end = segment.endedAt ? new Date(segment.endedAt) : new Date();
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) continue;

      const email = (segment.assigneeEmail || task.assignee.email || '').toLowerCase();
      if (!email) continue;
      if (filter && email !== filter) continue;
      const name = task.assignee.email?.toLowerCase() === email ? task.assignee.name : email;
      const schedule = scheduleForEmail(email, exceptions);

      let cursor = fromDate;
      while (cursor <= toDate) {
        if (!holidays.has(cursor)) {
          const dayStart = startOfIstDayUtc(cursor);
          const dayEnd = startOfIstDayUtc(addIstDays(cursor, 1));
          const sliceStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
          const sliceEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
          if (sliceEnd > sliceStart) {
            const hours = businessMsBetween(sliceStart, sliceEnd, schedule, holidays) / 3_600_000;
            if (hours > 0.001) {
              const key = `${cursor}|${email}`;
              const row =
                byKey.get(key) ||
                { date: cursor, email, name, hours: 0, tasks: [] };
              row.hours = Math.round((row.hours + hours) * 100) / 100;
              const existing = row.tasks.find((t) => t.id === task.id);
              if (existing) existing.hours = Math.round((existing.hours + hours) * 100) / 100;
              else row.tasks.push({ id: task.id, title: task.title, hours: Math.round(hours * 100) / 100 });
              byKey.set(key, row);
            }
          }
        }
        cursor = addIstDays(cursor, 1);
        if (cursor === fromDate) break;
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.date === b.date ? a.name.localeCompare(b.name) : b.date.localeCompare(a.date)
  );
}

export function emptyTimesheetRange(days = 14): { from: string; to: string } {
  const to = formatIsoDateIST(new Date());
  const from = formatIsoDateIST(new Date(Date.now() - (days - 1) * 86_400_000));
  return { from, to };
}

void DEFAULT_SCHEDULE;
