import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCalendarEntry, useUpdateCalendarEntry } from '@/hooks/calendar/useCalendar';
import { useCreateSyncedCalendarTask, useUpdateSyncedCalendarEntry } from '@/hooks/sync/useTaskCalendarSync';
import { toast } from 'sonner';
import type { CalendarEntry, Recurrence } from '@/backend';
import { Recurrence as RecurrenceEnum } from '@/backend';

interface CalendarEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry?: CalendarEntry | null;
}

export default function CalendarEntryFormDialog({
  open,
  onOpenChange,
  editingEntry,
}: CalendarEntryFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryType, setEntryType] = useState<'event' | 'task'>('event');
  const [recurrence, setRecurrence] = useState<string>('none');
  
  const createEntry = useCreateCalendarEntry();
  const updateEntry = useUpdateCalendarEntry();
  const createSyncedTask = useCreateSyncedCalendarTask();
  const updateSyncedEntry = useUpdateSyncedCalendarEntry();

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setDescription(editingEntry.description);
      const start = new Date(Number(editingEntry.startTime) / 1000000);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      if (editingEntry.endTime) {
        const end = new Date(Number(editingEntry.endTime) / 1000000);
        setEndTime(end.toTimeString().slice(0, 5));
      } else {
        setEndTime('');
      }
      setEntryType(editingEntry.taskId !== undefined && editingEntry.taskId !== null ? 'task' : 'event');
      setRecurrence(editingEntry.recurrence || 'none');
    } else {
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      setEndTime('');
      setEntryType('event');
      setRecurrence('none');
    }
  }, [editingEntry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const startTimestamp = BigInt(startDateTime.getTime() * 1000000);

    let endTimestamp: bigint | null = null;
    if (endTime) {
      const endDateTime = new Date(`${startDate}T${endTime}`);
      endTimestamp = BigInt(endDateTime.getTime() * 1000000);
    }

    const recurrenceValue: Recurrence | null = recurrence === 'none' ? null : (recurrence as Recurrence);

    try {
      if (editingEntry) {
        if (entryType === 'task') {
          await updateSyncedEntry.mutateAsync({
            entryId: editingEntry.id,
            title: title.trim(),
            description: description.trim(),
            startTime: startTimestamp,
            endTime: endTimestamp,
            recurrence: recurrenceValue,
            isTask: true,
          });
        } else {
          await updateEntry.mutateAsync({
            id: editingEntry.id,
            title: title.trim(),
            description: description.trim(),
            startTime: startTimestamp,
            endTime: endTimestamp,
          });
        }
        toast.success('Entry updated successfully');
      } else {
        if (entryType === 'task') {
          await createSyncedTask.mutateAsync({
            title: title.trim(),
            description: description.trim(),
            startTime: startTimestamp,
            endTime: endTimestamp,
            recurrence: recurrenceValue,
          });
          toast.success('Task created successfully');
        } else {
          await createEntry.mutateAsync({
            title: title.trim(),
            description: description.trim(),
            startTime: startTimestamp,
            endTime: endTimestamp,
          });
          toast.success('Event created successfully');
        }
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingEntry ? 'Failed to update entry' : 'Failed to create entry');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? 'Edit Entry' : 'Create Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryType">Type</Label>
            <Select value={entryType} onValueChange={(v) => setEntryType(v as 'event' | 'task')}>
              <SelectTrigger id="entryType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time (optional)</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value={RecurrenceEnum.daily}>Daily</SelectItem>
                <SelectItem value={RecurrenceEnum.weekly}>Weekly</SelectItem>
                <SelectItem value={RecurrenceEnum.monthly}>Monthly</SelectItem>
                <SelectItem value={RecurrenceEnum.yearly}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEntry.isPending || updateEntry.isPending || createSyncedTask.isPending || updateSyncedEntry.isPending}>
              {editingEntry ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
