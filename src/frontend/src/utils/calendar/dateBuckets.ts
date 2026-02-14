/**
 * Utility functions for normalizing calendar entry times into day keys
 * and building year/month/week grids.
 */

/**
 * Convert a timestamp to a day key (YYYY-MM-DD).
 */
export function timestampToDayKey(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toISOString().split('T')[0];
}

/**
 * Get all day keys for a given month.
 */
export function getMonthDayKeys(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    days.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

/**
 * Get all day keys for a given week (starting from a date).
 */
export function getWeekDayKeys(startDate: Date): string[] {
  const days: string[] = [];
  const date = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    days.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

/**
 * Get the start of the week (Sunday) for a given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Get all months in a year.
 */
export function getYearMonths(year: number): Array<{ month: number; name: string }> {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months.map((name, index) => ({ month: index, name }));
}
