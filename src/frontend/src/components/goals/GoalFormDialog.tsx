import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateGoal, useUpdateGoal } from '@/hooks/goals/useGoals';
import { toast } from 'sonner';
import type { Goal } from '@/backend';

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGoal?: Goal | null;
}

export default function GoalFormDialog({ open, onOpenChange, editingGoal }: GoalFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description);
      if (editingGoal.targetDate) {
        const date = new Date(Number(editingGoal.targetDate) / 1000000);
        setTargetDate(date.toISOString().split('T')[0]);
      } else {
        setTargetDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
    }
  }, [editingGoal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const targetDateTimestamp = targetDate
      ? BigInt(new Date(targetDate).getTime() * 1000000)
      : null;

    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({
          id: editingGoal.id,
          title: title.trim(),
          description: description.trim(),
          targetDate: targetDateTimestamp,
        });
        toast.success('Goal updated successfully');
      } else {
        await createGoal.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          targetDate: targetDateTimestamp,
        });
        toast.success('Goal created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingGoal ? 'Failed to update goal' : 'Failed to create goal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter goal description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending || updateGoal.isPending}>
              {editingGoal ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
