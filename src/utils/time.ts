/** Shared date/time helpers — all display times are Asia/Kolkata (IST). */

export const IST_TIMEZONE = 'Asia/Kolkata';

const IST_OPTS = { timeZone: IST_TIMEZONE } as const;

function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    ...IST_OPTS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short'
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour') === '24' ? '0' : get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: get('weekday')
  };
}

/** Calendar date in IST as YYYY-MM-DD (safe for HTML date inputs). */
export function formatIsoDateIST(date: Date = new Date()): string {
  const { year, month, day } = istParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** e.g. Aug 5, 2026 */
export function formatShortDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    ...IST_OPTS,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** e.g. Wednesday, August 5 */
export function formatLongDateIST(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', {
    ...IST_OPTS,
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/** Clock time in IST, e.g. 04:30 PM */
export function formatTimeIST(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    ...IST_OPTS,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/** Full stamp for activity / created dates, e.g. Aug 5, 2026, 4:30 PM */
export function nowTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('en-US', {
    ...IST_OPTS,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/** Day key for grouping (YYYY-MM-DD in IST). */
export function istDayKey(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return 'unknown';
  return formatIsoDateIST(d);
}

/** Start of the given instant's IST calendar day, as epoch ms (UTC). */
export function startOfIstDay(ms: number): number {
  const { year, month, day } = istParts(new Date(ms));
  // Construct noon IST then back up — avoids DST issues (IST has none) and UTC midnight skew.
  return Date.parse(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+05:30`
  );
}

/** Relative day label in IST: Today / Yesterday / weekday / short date. */
export function formatDayLabelIST(ms: number, nowMs: number = Date.now()): string {
  const diffDays = Math.round((startOfIstDay(nowMs) - startOfIstDay(ms)) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const d = new Date(ms);
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { ...IST_OPTS, weekday: 'long' });
  }
  const sameYear = istParts(d).year === istParts(new Date(nowMs)).year;
  return d.toLocaleDateString('en-US', {
    ...IST_OPTS,
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric'
  });
}

/** True when a stored stamp is the old "Just now" placeholder (or empty). */
export function isPlaceholderTimestamp(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return true;
  return value.trim().toLowerCase() === 'just now';
}

/** Pull epoch ms from ids like act-log-1712345678901 or comment-1712345678901 */
function timestampFromId(id: string | undefined): Date | null {
  if (!id) return null;
  const match = id.match(/(\d{12,})$/);
  if (!match) return null;
  const ms = Number(match[1]);
  if (Number.isNaN(ms) || ms < 1e12) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Display / migrate activity timestamps.
 * Replaces "Just now" (and similar) using the Date.now() embedded in the activity id when possible.
 */
export function resolveActivityTimestamp(
  activity: { id?: string; timestamp?: string },
  fallbackDate: Date = new Date()
): string {
  const raw = activity.timestamp?.trim() || '';
  if (raw && !isPlaceholderTimestamp(raw)) {
    return raw;
  }
  const fromId = timestampFromId(activity.id);
  if (fromId) return nowTimestamp(fromId);
  return nowTimestamp(fallbackDate);
}

/** HTML date input value (calendar day) → display string in IST */
export function dueDateFromInput(isoDate: string): string {
  // Interpret the picked calendar day as noon IST so it never rolls across a date boundary.
  const d = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return formatShortDate(d);
}

/** Display due string → HTML date input value (yyyy-mm-dd IST) when possible */
export function dueDateToInput(display: string): string {
  const d = new Date(display);
  if (!Number.isNaN(d.getTime())) {
    return formatIsoDateIST(d);
  }
  const parsed = Date.parse(display);
  if (!Number.isNaN(parsed)) {
    return formatIsoDateIST(new Date(parsed));
  }
  return formatIsoDateIST(new Date());
}

export function defaultDueDateInput(daysAhead = 7): string {
  const now = new Date();
  const { year, month, day } = istParts(now);
  const noonIst = Date.parse(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00+05:30`
  );
  return formatIsoDateIST(new Date(noonIst + daysAhead * 86_400_000));
}

export function roundHours(n: number): number {
  return Math.round(n * 10) / 10;
}

export function hoursPct(logged: number, estimated: number): number {
  if (!estimated || estimated <= 0) return 0;
  return Math.round((logged / estimated) * 100);
}
