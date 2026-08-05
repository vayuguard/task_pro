/** Mon–Sat, 10:00–18:00 Asia/Kolkata business-time calculator. */

export const BUSINESS_TIMEZONE = 'Asia/Kolkata';
const MAX_CREDITED_HOURS_PER_DAY = 8;

export interface WorkSchedule {
  /** 1 = Mon … 6 = Sat (0 = Sunday). */
  workDays: number[];
  startHour: number;
  endHour: number;
  timezone: string;
}

export const DEFAULT_SCHEDULE: WorkSchedule = {
  workDays: [1, 2, 3, 4, 5, 6],
  startHour: 10,
  endHour: 18,
  timezone: BUSINESS_TIMEZONE
};

function kolkataParts(d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: BUSINESS_TIMEZONE,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
      .formatToParts(d)
      .map((part) => [part.type, part.value])
  );
  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  return {
    weekday: weekdays[parts.weekday] ?? 0,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '0' : parts.hour),
    minute: Number(parts.minute)
  };
}

function kolkataToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) -
      5.5 * 60 * 60 * 1000
  );
}

function nextKolkataMidnightAfter(d: Date): Date {
  const p = kolkataParts(d);
  const nextUtcDate = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
  return kolkataToUtc(
    nextUtcDate.getUTCFullYear(),
    nextUtcDate.getUTCMonth() + 1,
    nextUtcDate.getUTCDate(),
    0,
    0
  );
}

function workWindowForDay(
  year: number,
  month: number,
  day: number,
  schedule: WorkSchedule
): { start: Date; end: Date } | null {
  const weekday = kolkataParts(kolkataToUtc(year, month, day, 12, 0)).weekday;
  if (!schedule.workDays.includes(weekday)) return null;
  return {
    start: kolkataToUtc(year, month, day, schedule.startHour, 0),
    end: kolkataToUtc(year, month, day, schedule.endHour, 0)
  };
}

/** Intersection of [start, end) with configured business windows. */
export function businessMsBetween(
  start: Date,
  end: Date,
  schedule: WorkSchedule = DEFAULT_SCHEDULE,
  holidays: Set<string> = new Set()
): number {
  if (end <= start) return 0;
  let total = 0;
  let cursor = new Date(start);

  while (cursor < end) {
    const p = kolkataParts(cursor);
    const dayKey = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
    const window = holidays.has(dayKey)
      ? null
      : workWindowForDay(p.year, p.month, p.day, schedule);

    if (window) {
      const segmentStart = Math.max(cursor.getTime(), window.start.getTime());
      const segmentEnd = Math.min(end.getTime(), window.end.getTime());
      if (segmentEnd > segmentStart) {
        total += Math.min(
          segmentEnd - segmentStart,
          MAX_CREDITED_HOURS_PER_DAY * 3_600_000
        );
      }
    }

    const next = nextKolkataMidnightAfter(cursor);
    cursor = next <= cursor ? new Date(cursor.getTime() + 86_400_000) : next;
  }

  return Math.max(0, total);
}

export function businessHoursBetween(
  start: Date,
  end: Date,
  schedule: WorkSchedule = DEFAULT_SCHEDULE,
  holidays?: Set<string>
): number {
  return Math.round((businessMsBetween(start, end, schedule, holidays) / 3_600_000) * 100) / 100;
}

export function isWithinBusinessHours(
  date: Date = new Date(),
  schedule: WorkSchedule = DEFAULT_SCHEDULE
): boolean {
  const p = kolkataParts(date);
  if (!schedule.workDays.includes(p.weekday)) return false;
  const minutes = p.hour * 60 + p.minute;
  return minutes >= schedule.startHour * 60 && minutes < schedule.endHour * 60;
}

export function nextBusinessStart(
  date: Date = new Date(),
  schedule: WorkSchedule = DEFAULT_SCHEDULE
): Date {
  const p = kolkataParts(date);
  const minutes = p.hour * 60 + p.minute;
  if (schedule.workDays.includes(p.weekday) && minutes < schedule.startHour * 60) {
    return kolkataToUtc(p.year, p.month, p.day, schedule.startHour, 0);
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const probe = new Date(Date.UTC(p.year, p.month - 1, p.day + offset));
    const candidate = kolkataToUtc(
      probe.getUTCFullYear(),
      probe.getUTCMonth() + 1,
      probe.getUTCDate(),
      schedule.startHour,
      0
    );
    if (schedule.workDays.includes(kolkataParts(candidate).weekday)) return candidate;
  }
  return date;
}
