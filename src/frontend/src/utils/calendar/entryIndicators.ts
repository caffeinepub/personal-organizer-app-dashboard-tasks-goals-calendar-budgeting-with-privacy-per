import type { CalendarEntry } from '@/backend';
import { timestampToDayKey } from './dateBuckets';
import { computeRecurringOccurrences } from './recurrence';

export function computeScheduledDays(entries: CalendarEntry[], rangeStart?: Date, rangeEnd?: Date): Set<string> {
  const scheduledDays = new Set<string>();
  
  const start = rangeStart || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const end = rangeEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  
  for (const entry of entries) {
    const dayKey = timestampToDayKey(entry.startTime);
    scheduledDays.add(dayKey);
    
    if (entry.recurrence) {
      const occurrences = computeRecurringOccurrences(entry.startTime, entry.recurrence, start, end);
      occurrences.forEach(occ => scheduledDays.add(occ));
    }
  }
  
  return scheduledDays;
}
