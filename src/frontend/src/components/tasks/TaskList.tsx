import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useToggleTaskCompletion, useDeleteTask } from '@/hooks/tasks/useTasks';
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
  const deleteTask = useDeleteTask();

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

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return null;
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const taskExamples = [
    { title: 'Complete workout routine', description: 'Morning training session' },
    { title: 'Review game strategy notes', description: 'Prepare for next match' },
    { title: 'Update personal records', description: 'Log progress privately' },
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
                disabled={toggleCompletion.isPending}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.description}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(task.dueDate)}
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
