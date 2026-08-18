/** Lightweight IST time helpers for server-side auth checks. */

const TZ = 'Asia/Kolkata';

export function getIstHour(date: Date = new Date()): { hour: number; minute: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    hour: Number(get('hour') === '24' ? '0' : get('hour')),
    minute: Number(get('minute')),
    weekday: weekdays[get('weekday')] ?? 0
  };
}

/**
 * Employee login break window.
 * Rule:
 * - can login before 10:30 AM IST
 * - if not, cannot login until 12:30 PM IST
 */
export function isPastLoginWindow(date: Date = new Date()): boolean {
  const { hour, minute } = getIstHour(date);

  // Allowed: before 10:30
  if (hour < 10) return false;
  if (hour === 10 && minute < 30) return false;

  // Blocked: 10:30 <= time < 12:30
  if (hour === 10 && minute >= 30) return true;
  if (hour === 11) return true;
  if (hour === 12 && minute < 30) return true;

  // Allowed: 12:30 onwards (but still blocked by separate 6 PM rule)
  return false;
}

/** True if IST time is at or after 6 PM. */
export function isPastWorkHours(date: Date = new Date()): boolean {
  const { hour } = getIstHour(date);
  return hour >= 18;
}
