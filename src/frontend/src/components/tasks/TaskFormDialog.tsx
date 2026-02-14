import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTask, useUpdateTask } from '@/hooks/tasks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/backend';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

export default function TaskFormDialog({ open, onOpenChange, editingTask }: TaskFormDialogProps) {
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (editingTask) {
      setDescription(editingTask.description);
      if (editingTask.dueDate) {
        const date = new Date(Number(editingTask.dueDate) / 1000000);
        setDueDate(date.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
    } else {
      setDescription('');
      setDueDate('');
    }
  }, [editingTask, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    const dueDateTimestamp = dueDate
      ? BigInt(new Date(dueDate).getTime() * 1000000)
      : null;

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          description: description.trim(),
          dueDate: dueDateTimestamp,
        });
        toast.success('Task updated successfully');
      } else {
        await createTask.mutateAsync({
          description: description.trim(),
          dueDate: dueDateTimestamp,
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
