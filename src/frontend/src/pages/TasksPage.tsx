import { useState } from 'react';
import { useGetTasks } from '@/hooks/tasks/useTasks';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import IntegrityWarningBanner from '@/components/common/IntegrityWarningBanner';
import SecurityNote from '@/components/common/SecurityNote';
import { useIntegrityVerifier } from '@/hooks/integrity/useIntegrityVerifier';

export default function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tasks = [], isLoading } = useGetTasks();
  const { hasIntegrityIssues } = useIntegrityVerifier(tasks, 'tasks');

  return (
    <div className="space-y-5 tasks-theme">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">Manage your daily tasks and to-dos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {hasIntegrityIssues && (
        <IntegrityWarningBanner message="Some tasks may have been tampered with. Please verify your data." />
      )}

      <SecurityNote />

      <TaskList tasks={tasks} isLoading={isLoading} />

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
