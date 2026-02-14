import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useDeleteCalendarEntry } from '@/hooks/calendar/useCalendar';
import { toast } from 'sonner';
import type { CalendarEntry } from '@/backend';
import { useState } from 'react';
import CalendarEntryFormDialog from './CalendarEntryFormDialog';
import SectionExamples from '@/components/common/SectionExamples';

interface CalendarEntryListProps {
  entries: CalendarEntry[];
  isLoading: boolean;
}

export default function CalendarEntryList({ entries, isLoading }: CalendarEntryListProps) {
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const deleteEntry = useDeleteCalendarEntry();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const sortedEntries = [...entries].sort((a, b) => {
    return Number(a.startTime) - Number(b.startTime);
  });

  const calendarExamples = [
    { title: 'Team Meeting', description: 'Weekly sync at 10:00 AM' },
    { title: 'Doctor Appointment', description: 'Annual checkup at 2:00 PM' },
    { title: 'Dinner with Friends', description: 'Restaurant reservation at 7:00 PM' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="settings-card">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No events yet. Create your first event to get started!
          </CardContent>
        </Card>
        <SectionExamples sectionName="Calendar Events" examples={calendarExamples} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sortedEntries.map((entry) => {
          const start = formatDateTime(entry.startTime);
          const end = entry.endTime ? formatDateTime(entry.endTime) : null;

          return (
            <Card key={entry.id.toString()} className="settings-card">
              <CardContent className="flex items-start gap-3 py-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold">{entry.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{start.date}</span>
                    <span>
                      {start.time}
                      {end && ` - ${end.time}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CalendarEntryFormDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        editingEntry={editingEntry}
      />
    </>
  );
}
