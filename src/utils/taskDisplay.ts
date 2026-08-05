import { Task } from '../types';
import { getWallWorkingHours, getWorkingHours } from './taskTiming';

export function getTaskHours(task: Task): number {
  return task.timeLoggedBusiness ?? getWorkingHours(task);
}

export function getTaskWallHours(task: Task): number {
  return task.timeLoggedWall ?? getWallWorkingHours(task);
}
