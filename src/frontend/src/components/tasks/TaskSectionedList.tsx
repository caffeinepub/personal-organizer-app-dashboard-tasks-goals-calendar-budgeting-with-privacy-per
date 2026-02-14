import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useToggleTaskCompletion, useDeleteTask } from '@/hooks/tasks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/backend';
import { useState } from 'react';
import TaskFormDialog from './TaskFormDialog';
import SectionExamples from '@/components/common/SectionExamples';
import { getTaskSection, getTaskSectionLabel, getDayOfWeekLabel, getTaskDayOfWeek } from '@/utils/tasks/taskTypeLabel';

interface TaskSectionedListProps {
  tasks: Task[];
  isLoading: boolean;
}

export default function TaskSectionedList({ tasks, isLoading }: TaskSectionedListProps) {
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

  // Group tasks by section
  const dayOfWeekTasks = tasks.filter((t) => getTaskSection(t.taskType) === 'dayOfWeek');
  const dailyTasks = tasks.filter((t) => getTaskSection(t.taskType) === 'daily');
  const weekendTasks = tasks.filter((t) => getTaskSection(t.taskType) === 'weekend');

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

  const renderTask = (task: Task) => {
    const dayOfWeek = getTaskDayOfWeek(task.taskType);
    
    return (
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {dayOfWeek && <span className="font-medium">{getDayOfWeekLabel(dayOfWeek)}</span>}
              {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
            </div>
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
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Day-of-Week Tasks Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{getTaskSectionLabel('dayOfWeek')}</h2>
          {dayOfWeekTasks.length === 0 ? (
            <Card className="tasks-card">
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                No day-of-week tasks yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dayOfWeekTasks.map(renderTask)}
            </div>
          )}
        </div>

        {/* Recurring Daily Tasks Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{getTaskSectionLabel('daily')}</h2>
          {dailyTasks.length === 0 ? (
            <Card className="tasks-card">
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                No recurring daily tasks yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dailyTasks.map(renderTask)}
            </div>
          )}
        </div>

        {/* Weekend Tasks Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{getTaskSectionLabel('weekend')}</h2>
          {weekendTasks.length === 0 ? (
            <Card className="tasks-card">
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                No weekend tasks yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {weekendTasks.map(renderTask)}
            </div>
          )}
        </div>
      </div>

      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        editingTask={editingTask}
      />
    </>
  );
}
