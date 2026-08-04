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
  // try "Oct 24, 2023" style
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
