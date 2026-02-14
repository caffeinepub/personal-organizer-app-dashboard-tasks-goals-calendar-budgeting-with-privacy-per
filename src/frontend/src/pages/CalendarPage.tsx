import { useState } from 'react';
import { useGetCalendarEntries } from '@/hooks/calendar/useCalendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CalendarEntryList from '@/components/calendar/CalendarEntryList';
import CalendarEntryFormDialog from '@/components/calendar/CalendarEntryFormDialog';
import IntegrityWarningBanner from '@/components/common/IntegrityWarningBanner';
import SecurityNote from '@/components/common/SecurityNote';
import { useIntegrityVerifier } from '@/hooks/integrity/useIntegrityVerifier';
import { useCalendarViewPreference } from '@/hooks/calendar/useCalendarViewPreference';
import CalendarViewSelector from '@/components/calendar/CalendarViewSelector';
import YearCalendarView from '@/components/calendar/views/YearCalendarView';
import MonthCalendarView from '@/components/calendar/views/MonthCalendarView';
import WeekCalendarView from '@/components/calendar/views/WeekCalendarView';
import { computeScheduledDays } from '@/utils/calendar/entryIndicators';
import { getWeekStart } from '@/utils/calendar/dateBuckets';

export default function CalendarPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: entries = [], isLoading } = useGetCalendarEntries();
  const { hasIntegrityIssues } = useIntegrityVerifier(entries, 'calendar');
  const { view, setView } = useCalendarViewPreference();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(now));

  const scheduledDays = computeScheduledDays(entries);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">Schedule and view your events</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarViewSelector view={view} onViewChange={setView} />
          <Button onClick={() => setDialogOpen(true)} size="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {hasIntegrityIssues && (
        <IntegrityWarningBanner message="Some calendar entries may have been tampered with. Please verify your data." />
      )}

      <SecurityNote />

      {view === 'year' && (
        <YearCalendarView
          year={selectedYear}
          scheduledDays={scheduledDays}
        />
      )}

      {view === 'month' && (
        <MonthCalendarView
          year={selectedYear}
          month={selectedMonth}
          scheduledDays={scheduledDays}
          onMonthChange={(year, month) => {
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
        />
      )}

      {view === 'week' && (
        <WeekCalendarView
          startDate={selectedWeekStart}
          scheduledDays={scheduledDays}
          onWeekChange={setSelectedWeekStart}
        />
      )}

      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-3">All Events</h2>
        <CalendarEntryList entries={entries} isLoading={isLoading} />
      </div>

      <CalendarEntryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
