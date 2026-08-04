import { TaskPriority } from '../types';

export const TASK_PRIORITIES: TaskPriority[] = ['Highest', 'High', 'Medium', 'Low'];

export function priorityBadgeClass(priority: TaskPriority | string): string {
  switch (priority) {
    case 'Highest':
      return 'bg-rose-600 text-white border-rose-700';
    case 'High':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Low':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function priorityIcon(priority: TaskPriority | string): string {
  switch (priority) {
    case 'Highest':
      return 'keyboard_double_arrow_up';
    case 'High':
      return 'priority_high';
    case 'Medium':
      return 'remove';
    case 'Low':
      return 'low_priority';
    default:
      return 'info';
  }
}

export function priorityRank(priority: TaskPriority | string): number {
  switch (priority) {
    case 'Highest':
      return 4;
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
      return 1;
    default:
      return 0;
  }
}
