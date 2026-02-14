import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useToggleTaskCompletion } from '@/hooks/tasks/useTasks';
import { useDeleteSyncedTask } from '@/hooks/sync/useTaskCalendarSync';
import { toast } from 'sonner';
import type { Task } from '@/backend';
import { useState } from 'react';
import TaskFormDialog from './TaskFormDialog';
import SectionExamples from '@/components/common/SectionExamples';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

export default function TaskList({ tasks, isLoading }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const toggleCompletion = useToggleTaskCompletion();
  const deleteTask = useDeleteSyncedTask();

  const handleToggle = async (id: bigint) => {
    try {
      await toggleCompletion.mutateAsync(id);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const taskExamples = [
    { title: 'Morning workout', description: 'Daily routine at 6:00 AM' },
    { title: 'Team standup', description: 'Every Monday at 9:00 AM' },
    { title: 'Grocery shopping', description: 'Weekend errands' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="tasks-card">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No tasks yet. Create your first task to get started!
          </CardContent>
        </Card>
        <SectionExamples sectionName="Tasks" examples={taskExamples} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id.toString()} className="tasks-card">
            <CardContent className="flex items-center gap-3 py-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id)}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.description}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due: {new Date(Number(task.dueDate) / 1000000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingTask(task)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(task.id)}
                  disabled={deleteTask.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        editingTask={editingTask}
      />
    </>
  );
}
