/** Shared date/time helpers for TaskPro logs and due dates */

export function nowTimestamp(date: Date = new Date()): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
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

export function formatShortDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** HTML date input value → display string */
export function dueDateFromInput(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return formatShortDate(d);
}

/** Display due string → HTML date input value (yyyy-mm-dd) when possible */
export function dueDateToInput(display: string): string {
  const d = new Date(display);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  const parsed = Date.parse(display);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function defaultDueDateInput(daysAhead = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export function roundHours(n: number): number {
  return Math.round(n * 10) / 10;
}

export function hoursPct(logged: number, estimated: number): number {
  if (!estimated || estimated <= 0) return 0;
  return Math.round((logged / estimated) * 100);
}
