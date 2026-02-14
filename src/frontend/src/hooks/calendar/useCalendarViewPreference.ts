import { useState, useEffect } from 'react';

export type CalendarView = 'year' | 'month' | 'week';

const STORAGE_KEY = 'calendar-view-preference';

export function useCalendarViewPreference() {
  const [view, setViewState] = useState<CalendarView>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'year' || stored === 'month' || stored === 'week') ? stored : 'month';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view);
  }, [view]);

  return {
    view,
    setView: setViewState,
  };
}
