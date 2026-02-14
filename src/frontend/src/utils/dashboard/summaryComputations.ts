import type { Task, Goal, CalendarEntry, BudgetItem } from '@/backend';
import type { SummaryMode } from '@/hooks/dashboard/useDashboardSummaryPreferences';

interface SummaryStat {
  label: string;
  value: string | number;
}

interface SummaryResult {
  stats: SummaryStat[];
  secondary?: string;
  isEmpty: boolean;
}

export function computeTasksSummary(tasks: Task[], mode: SummaryMode): SummaryResult {
  if (tasks.length === 0) {
    return { stats: [], isEmpty: true };
  }

  if (mode === 'stats') {
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - completed;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && Number(t.dueDate) < Date.now() * 1_000_000
    ).length;

    return {
      stats: [
        { label: 'Total', value: tasks.length },
        { label: 'Completed', value: completed },
        { label: 'Pending', value: pending },
        ...(overdue > 0 ? [{ label: 'Overdue', value: overdue }] : []),
      ],
      isEmpty: false,
    };
  } else {
    // Recent mode
    const recentTasks = [...tasks]
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 3);
    const recentTask = recentTasks[0];

    return {
      stats: [
        { label: 'Total', value: tasks.length },
        { label: 'Completed', value: tasks.filter((t) => t.completed).length },
      ],
      secondary: recentTask ? `Latest: ${recentTask.description}` : undefined,
      isEmpty: false,
    };
  }
}

export function computeGoalsSummary(goals: Goal[], mode: SummaryMode): SummaryResult {
  if (goals.length === 0) {
    return { stats: [], isEmpty: true };
  }

  if (mode === 'stats') {
    const avgProgress =
      goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + Number(g.progress), 0) / goals.length)
        : 0;
    const completed = goals.filter((g) => Number(g.progress) >= 100).length;

    return {
      stats: [
        { label: 'Total', value: goals.length },
        { label: 'Completed', value: completed },
        { label: 'Avg Progress', value: `${avgProgress}%` },
      ],
      isEmpty: false,
    };
  } else {
    // Recent mode
    const recentGoal = goals[goals.length - 1];

    return {
      stats: [
        { label: 'Total', value: goals.length },
        { label: 'Avg Progress', value: `${Math.round(goals.reduce((sum, g) => sum + Number(g.progress), 0) / goals.length)}%` },
      ],
      secondary: recentGoal ? `Latest: ${recentGoal.title}` : undefined,
      isEmpty: false,
    };
  }
}

export function computeCalendarSummary(
  entries: CalendarEntry[],
  mode: SummaryMode
): SummaryResult {
  if (entries.length === 0) {
    return { stats: [], isEmpty: true };
  }

  const now = Date.now() * 1_000_000;
  const upcoming = entries.filter((e) => Number(e.startTime) > now);
  const today = entries.filter((e) => {
    const startDate = new Date(Number(e.startTime) / 1_000_000);
    const todayDate = new Date();
    return (
      startDate.getDate() === todayDate.getDate() &&
      startDate.getMonth() === todayDate.getMonth() &&
      startDate.getFullYear() === todayDate.getFullYear()
    );
  });

  if (mode === 'stats') {
    return {
      stats: [
        { label: 'Total', value: entries.length },
        { label: 'Today', value: today.length },
        { label: 'Upcoming', value: upcoming.length },
      ],
      isEmpty: false,
    };
  } else {
    // Recent mode
    const nextEvent = upcoming.sort((a, b) => Number(a.startTime - b.startTime))[0];

    return {
      stats: [
        { label: 'Total', value: entries.length },
        { label: 'Upcoming', value: upcoming.length },
      ],
      secondary: nextEvent
        ? `Next: ${nextEvent.title} on ${new Date(Number(nextEvent.startTime) / 1_000_000).toLocaleDateString()}`
        : 'No upcoming events',
      isEmpty: false,
    };
  }
}

export function computeBudgetSummary(items: BudgetItem[], mode: SummaryMode): SummaryResult {
  if (items.length === 0) {
    return { stats: [], isEmpty: true };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthItems = items.filter((item) => {
    const itemDate = new Date(Number(item.date) / 1_000_000);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  const income = currentMonthItems
    .filter((item) => item.itemType === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = currentMonthItems
    .filter((item) => item.itemType === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const net = income - expenses;

  if (mode === 'stats') {
    return {
      stats: [
        { label: 'Income', value: `$${income.toLocaleString()}` },
        { label: 'Expenses', value: `$${expenses.toLocaleString()}` },
        { label: 'Net', value: `$${net.toLocaleString()}` },
      ],
      isEmpty: false,
    };
  } else {
    // Recent mode
    const recentItem = [...items].sort((a, b) => Number(b.date - a.date))[0];

    return {
      stats: [
        { label: 'This Month', value: currentMonthItems.length },
        { label: 'Net', value: `$${net.toLocaleString()}` },
      ],
      secondary: recentItem
        ? `Latest: ${recentItem.description} ($${Number(recentItem.amount).toLocaleString()})`
        : undefined,
      isEmpty: false,
    };
  }
}
