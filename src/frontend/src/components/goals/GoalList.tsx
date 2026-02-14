import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useDeleteGoal, useUpdateGoalProgress } from '@/hooks/goals/useGoals';
import { toast } from 'sonner';
import type { Goal } from '@/backend';
import { useState } from 'react';
import GoalFormDialog from './GoalFormDialog';
import { Slider } from '@/components/ui/slider';
import SectionExamples from '@/components/common/SectionExamples';

interface GoalListProps {
  goals: Goal[];
  isLoading: boolean;
}

export default function GoalList({ goals, isLoading }: GoalListProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const deleteGoal = useDeleteGoal();
  const updateProgress = useUpdateGoalProgress();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal.mutateAsync(id);
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleProgressChange = async (id: bigint, value: number[]) => {
    try {
      await updateProgress.mutateAsync({ id, progress: BigInt(value[0]) });
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return null;
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const goalExamples = [
    { title: 'Learn a new skill', description: 'Complete online course by end of quarter' },
    { title: 'Save for vacation', description: 'Set aside $2000 by summer' },
    { title: 'Read 12 books', description: 'One book per month this year' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="settings-card">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No goals yet. Create your first goal to get started!
          </CardContent>
        </Card>
        <SectionExamples sectionName="Goals" examples={goalExamples} />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id.toString()} className="settings-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {formatDate(goal.targetDate)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingGoal(goal)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleteGoal.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{goal.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Number(goal.progress)}%</span>
                </div>
                <Progress value={Number(goal.progress)} />
                <Slider
                  value={[Number(goal.progress)]}
                  onValueChange={(value) => handleProgressChange(goal.id, value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <GoalFormDialog
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        editingGoal={editingGoal}
      />
    </>
  );
}
