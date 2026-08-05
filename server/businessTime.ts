/**
 * Kept as the server import boundary. The implementation is shared with the
 * client so live displays and persisted certified time follow identical rules.
 */
export {
  BUSINESS_TIMEZONE,
  DEFAULT_SCHEDULE,
  businessHoursBetween,
  businessMsBetween,
  isWithinBusinessHours,
  nextBusinessStart
} from '../src/utils/businessTime.ts';
export type { WorkSchedule } from '../src/utils/businessTime.ts';
