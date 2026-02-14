import type { TaskType, DayOfWeek } from '@/backend';
import { DayOfWeek as DayOfWeekEnum } from '@/backend';

export type TaskSection = 'dayOfWeek' | 'daily' | 'weekend';

/**
 * Get the section a task belongs to based on its taskType.
 */
export function getTaskSection(taskType: TaskType): TaskSection {
  if (taskType.__kind__ === 'daily') {
    return 'daily';
  } else if (taskType.__kind__ === 'weekend') {
    return 'weekend';
  } else if (taskType.__kind__ === 'dayOfWeek') {
    return 'dayOfWeek';
  }
  // Fallback for unexpected values
  return 'dayOfWeek';
}

/**
 * Get a human-readable label for a task section.
 */
export function getTaskSectionLabel(section: TaskSection): string {
  switch (section) {
    case 'dayOfWeek':
      return 'Day-of-Week Tasks';
    case 'daily':
      return 'Recurring Daily Tasks';
    case 'weekend':
      return 'Weekend Tasks';
  }
}

/**
 * Get a human-readable label for a day of week.
 */
export function getDayOfWeekLabel(day: DayOfWeek): string {
  switch (day) {
    case DayOfWeekEnum.monday:
      return 'Monday';
    case DayOfWeekEnum.tuesday:
      return 'Tuesday';
    case DayOfWeekEnum.wednesday:
      return 'Wednesday';
    case DayOfWeekEnum.thursday:
      return 'Thursday';
    case DayOfWeekEnum.friday:
      return 'Friday';
    default:
      return 'Unknown';
  }
}

/**
 * Get the day of week from a taskType if it's a dayOfWeek type.
 */
export function getTaskDayOfWeek(taskType: TaskType): DayOfWeek | null {
  if (taskType.__kind__ === 'dayOfWeek') {
    return taskType.dayOfWeek;
  }
  return null;
}
