import { useState } from 'react';
import { useGetCalendarEntries } from '@/hooks/calendar/useCalendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CalendarEntryList from '@/components/calendar/CalendarEntryList';
import CalendarEntryFormDialog from '@/components/calendar/CalendarEntryFormDialog';
import IntegrityWarningBanner from '@/components/common/IntegrityWarningBanner';
import SecurityNote from '@/components/common/SecurityNote';
import { useIntegrityVerifier } from '@/hooks/integrity/useIntegrityVerifier';

export default function CalendarPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: entries = [], isLoading } = useGetCalendarEntries();
  const { hasIntegrityIssues } = useIntegrityVerifier(entries, 'calendar');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">Schedule and view your events</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {hasIntegrityIssues && (
        <IntegrityWarningBanner message="Some calendar entries may have been tampered with. Please verify your data." />
      )}

      <SecurityNote />

      <CalendarEntryList entries={entries} isLoading={isLoading} />

      <CalendarEntryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
