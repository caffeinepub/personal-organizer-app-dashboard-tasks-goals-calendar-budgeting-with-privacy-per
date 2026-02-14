import type { Task, Goal, CalendarEntry, BudgetItem } from '@/backend';

export function canonicalizeTask(task: Task): string {
  return JSON.stringify({
    id: task.id.toString(),
    description: task.description,
    completed: task.completed,
    createdAt: task.createdAt.toString(),
    dueDate: task.dueDate?.toString() || null,
  });
}

export function canonicalizeGoal(goal: Goal): string {
  return JSON.stringify({
    id: goal.id.toString(),
    title: goal.title,
    description: goal.description,
    progress: goal.progress.toString(),
    targetDate: goal.targetDate?.toString() || null,
  });
}

export function canonicalizeCalendarEntry(entry: CalendarEntry): string {
  return JSON.stringify({
    id: entry.id.toString(),
    title: entry.title,
    description: entry.description,
    startTime: entry.startTime.toString(),
    endTime: entry.endTime?.toString() || null,
  });
}

export function canonicalizeBudgetItem(item: BudgetItem): string {
  return JSON.stringify({
    id: item.id.toString(),
    amount: item.amount.toString(),
    description: item.description,
    date: item.date.toString(),
    itemType: item.itemType,
  });
}
