/** 1 day = 8 business hours (Mon–Sat office day). */
export const HOURS_PER_DAY = 8;

export type EstimateParts = {
  days: number;
  hours: number;
  minutes: number;
};

export function estimatePartsToHours(parts: EstimateParts): number {
  const days = Number.isFinite(parts.days) ? Math.max(0, parts.days) : 0;
  const hours = Number.isFinite(parts.hours) ? Math.max(0, parts.hours) : 0;
  const minutes = Number.isFinite(parts.minutes) ? Math.max(0, parts.minutes) : 0;
  return Math.round((days * HOURS_PER_DAY + hours + minutes / 60) * 100) / 100;
}

export function hoursToEstimateParts(totalHours: number): EstimateParts {
  const total = Math.max(0, Number.isFinite(totalHours) ? totalHours : 0);
  const totalMinutes = Math.round(total * 60);
  const dayMinutes = HOURS_PER_DAY * 60;
  const days = Math.floor(totalMinutes / dayMinutes);
  const rem = totalMinutes - days * dayMinutes;
  const hours = Math.floor(rem / 60);
  const minutes = rem % 60;
  return { days, hours, minutes };
}

export function formatEstimate(totalHours: number): string {
  const { days, hours, minutes } = hoursToEstimateParts(totalHours);
  const bits: string[] = [];
  if (days) bits.push(`${days}d`);
  if (hours) bits.push(`${hours}h`);
  if (minutes) bits.push(`${minutes}m`);
  return bits.length ? bits.join(' ') : '0h';
}
