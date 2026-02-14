import { useState } from 'react';
import { useGetGoals } from '@/hooks/goals/useGoals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import GoalList from '@/components/goals/GoalList';
import GoalFormDialog from '@/components/goals/GoalFormDialog';
import IntegrityWarningBanner from '@/components/common/IntegrityWarningBanner';
import SecurityNote from '@/components/common/SecurityNote';
import { useIntegrityVerifier } from '@/hooks/integrity/useIntegrityVerifier';

export default function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: goals = [], isLoading } = useGetGoals();
  const { hasIntegrityIssues } = useIntegrityVerifier(goals, 'goals');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm">Track your long-term goals and progress</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {hasIntegrityIssues && (
        <IntegrityWarningBanner message="Some goals may have been tampered with. Please verify your data." />
      )}

      <SecurityNote />

      <GoalList goals={goals} isLoading={isLoading} />

      <GoalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
