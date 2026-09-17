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

function istMinutes(date: Date = new Date()): number {
  const { hour, minute } = getIstHour(date);
  return hour * 60 + minute;
}

/**
 * Employee login windows (IST):
 * - 9:00 AM – 10:00 AM
 * - 1:30 PM – 2:30 PM
 * Outside these windows only admin may log in.
 */
export function isEmployeeLoginAllowed(date: Date = new Date()): boolean {
  const mins = istMinutes(date);
  if (mins >= 9 * 60 && mins < 10 * 60) return true;
  if (mins >= 13 * 60 + 30 && mins < 14 * 60 + 30) return true;
  return false;
}

/** True when employees are outside both login windows. */
export function isPastLoginWindow(date: Date = new Date()): boolean {
  return !isEmployeeLoginAllowed(date);
}

export function employeeLoginBlockedMessage(date: Date = new Date()): string {
  const mins = istMinutes(date);
  if (mins < 9 * 60) {
    return 'Login opens at 9:00 AM IST. Please try again then.';
  }
  if (mins >= 10 * 60 && mins < 13 * 60 + 30) {
    return 'Morning login closed at 10:00 AM IST. Next window is 1:30 PM–2:30 PM IST.';
  }
  return 'Login closed after 2:30 PM IST. Next window is tomorrow 9:00 AM–10:00 AM IST.';
}

/** True if IST time is at or after 6 PM (session auto-logout). */
export function isPastWorkHours(date: Date = new Date()): boolean {
  const { hour } = getIstHour(date);
  return hour >= 18;
}
