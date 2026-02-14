import type { Recurrence } from '@/backend';
import { Recurrence as RecurrenceEnum } from '@/backend';

export function computeRecurringOccurrences(
  startTime: bigint,
  recurrence: Recurrence,
  rangeStart: Date,
  rangeEnd: Date
): string[] {
  const occurrences: string[] = [];
  const baseDate = new Date(Number(startTime) / 1000000);
  
  let currentDate = new Date(baseDate);
  
  while (currentDate <= rangeEnd) {
    if (currentDate >= rangeStart) {
      const dayKey = currentDate.toISOString().split('T')[0];
      occurrences.push(dayKey);
    }
    
    switch (recurrence) {
      case RecurrenceEnum.daily:
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case RecurrenceEnum.weekly:
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case RecurrenceEnum.monthly:
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case RecurrenceEnum.yearly:
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
    
    if (currentDate.getTime() - baseDate.getTime() > 365 * 24 * 60 * 60 * 1000 * 2) {
      break;
    }
  }
  
  return occurrences;
}
