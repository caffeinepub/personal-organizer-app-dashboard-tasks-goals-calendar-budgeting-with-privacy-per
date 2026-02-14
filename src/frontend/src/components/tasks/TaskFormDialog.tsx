import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSyncedTask, useUpdateSyncedTask } from '@/hooks/sync/useTaskCalendarSync';
import { toast } from 'sonner';
import type { Task, TaskType, DayOfWeek } from '@/backend';
import { DayOfWeek as DayOfWeekEnum } from '@/backend';
import { getTaskSection, getTaskDayOfWeek } from '@/utils/tasks/taskTypeLabel';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

export default function TaskFormDialog({ open, onOpenChange, editingTask }: TaskFormDialogProps) {
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskTypeSection, setTaskTypeSection] = useState<'dayOfWeek' | 'daily' | 'weekend'>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeekEnum.monday);
  
  const createTask = useCreateSyncedTask();
  const updateTask = useUpdateSyncedTask();

  useEffect(() => {
    if (editingTask) {
      setDescription(editingTask.description);
      if (editingTask.dueDate) {
        const date = new Date(Number(editingTask.dueDate) / 1000000);
        setDueDate(date.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
      const section = getTaskSection(editingTask.taskType);
      setTaskTypeSection(section);
      if (section === 'dayOfWeek') {
        const day = getTaskDayOfWeek(editingTask.taskType);
        if (day) setSelectedDay(day);
      }
    } else {
      setDescription('');
      setDueDate('');
      setTaskTypeSection('daily');
      setSelectedDay(DayOfWeekEnum.monday);
    }
  }, [editingTask, open]);

  const buildTaskType = (): TaskType => {
    if (taskTypeSection === 'dayOfWeek') {
      return { __kind__: 'dayOfWeek', dayOfWeek: selectedDay };
    } else if (taskTypeSection === 'daily') {
      return { __kind__: 'daily', daily: null };
    } else {
      return { __kind__: 'weekend', weekend: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    const taskType = buildTaskType();
    let dueDateTimestamp: bigint | null = null;
    if (dueDate) {
      const date = new Date(dueDate);
      dueDateTimestamp = BigInt(date.getTime() * 1000000);
    }

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          taskId: editingTask.id,
          description: description.trim(),
          dueDate: dueDateTimestamp,
          taskType,
        });
        toast.success('Task updated successfully');
      } else {
        await createTask.mutateAsync({
          description: description.trim(),
          dueDate: dueDateTimestamp!,
          taskType,
        });
        toast.success('Task created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select value={taskTypeSection} onValueChange={(v) => setTaskTypeSection(v as any)}>
              <SelectTrigger id="taskType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dayOfWeek">Day of Week</SelectItem>
                <SelectItem value="daily">Recurring Daily</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {taskTypeSection === 'dayOfWeek' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Select Day</Label>
              <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayOfWeek)}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DayOfWeekEnum.monday}>Monday</SelectItem>
                  <SelectItem value={DayOfWeekEnum.tuesday}>Tuesday</SelectItem>
                  <SelectItem value={DayOfWeekEnum.wednesday}>Wednesday</SelectItem>
                  <SelectItem value={DayOfWeekEnum.thursday}>Thursday</SelectItem>
                  <SelectItem value={DayOfWeekEnum.friday}>Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
