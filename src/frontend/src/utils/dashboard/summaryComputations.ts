import type { Task, Goal, CalendarEntry, BudgetItem } from '@/backend';
import { formatCentsAsCurrency } from '@/utils/money';

export type SummaryMode = 'stats' | 'recent';

export interface TasksSummary {
  stats: Array<{ label: string; value: string | number }>;
  secondary?: string;
  isEmpty: boolean;
  completed: number;
  pending: number;
  total: number;
  recentTasks?: Task[];
}

export interface GoalsSummary {
  stats: Array<{ label: string; value: string | number }>;
  secondary?: string;
  isEmpty: boolean;
  total: number;
  inProgress: number;
  completed: number;
  recentGoals?: Goal[];
}

export interface CalendarSummary {
  stats: Array<{ label: string; value: string | number }>;
  secondary?: string;
  isEmpty: boolean;
  total: number;
  upcoming: number;
  today: number;
  recentEntries?: CalendarEntry[];
}

export interface BudgetSummary {
  stats: Array<{ label: string; value: string | number }>;
  secondary?: string;
  isEmpty: boolean;
  income: string;
  expenses: string;
  net: string;
  recentItems?: BudgetItem[];
}

export function computeTasksSummary(tasks: Task[], mode: SummaryMode = 'stats'): TasksSummary {
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const total = tasks.length;
  const isEmpty = total === 0;

  const stats = [
    { label: 'Total', value: total },
    { label: 'Completed', value: completed },
    { label: 'Pending', value: pending },
  ];

  if (mode === 'recent') {
    const recentTasks = [...tasks]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 3);
    
    const secondary = recentTasks.length > 0
      ? `Recent: ${recentTasks[0].description.substring(0, 40)}${recentTasks[0].description.length > 40 ? '...' : ''}`
      : undefined;

    return { stats, secondary, isEmpty, completed, pending, total, recentTasks };
  }

  return { stats, isEmpty, completed, pending, total };
}

export function computeGoalsSummary(goals: Goal[], mode: SummaryMode = 'stats'): GoalsSummary {
  const total = goals.length;
  const completed = goals.filter((g) => Number(g.progress) >= 100).length;
  const inProgress = goals.filter((g) => Number(g.progress) > 0 && Number(g.progress) < 100).length;
  const isEmpty = total === 0;

  const stats = [
    { label: 'Total', value: total },
    { label: 'In Progress', value: inProgress },
    { label: 'Completed', value: completed },
  ];

  if (mode === 'recent') {
    const recentGoals = [...goals]
      .sort((a, b) => Number(b.progress) - Number(a.progress))
      .slice(0, 3);
    
    const secondary = recentGoals.length > 0
      ? `Top: ${recentGoals[0].title.substring(0, 40)}${recentGoals[0].title.length > 40 ? '...' : ''}`
      : undefined;

    return { stats, secondary, isEmpty, total, inProgress, completed, recentGoals };
  }

  return { stats, isEmpty, total, inProgress, completed };
}

export function computeCalendarSummary(entries: CalendarEntry[], mode: SummaryMode = 'stats'): CalendarSummary {
  const now = Date.now() * 1000000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartNano = BigInt(todayStart.getTime() * 1000000);
  const todayEndNano = BigInt((todayStart.getTime() + 86400000) * 1000000);

  const total = entries.length;
  const upcoming = entries.filter((e) => Number(e.startTime) > now).length;
  const today = entries.filter(
    (e) => e.startTime >= todayStartNano && e.startTime < todayEndNano
  ).length;
  const isEmpty = total === 0;

  const stats = [
    { label: 'Total', value: total },
    { label: 'Today', value: today },
    { label: 'Upcoming', value: upcoming },
  ];

  if (mode === 'recent') {
    const recentEntries = [...entries]
      .sort((a, b) => Number(b.startTime) - Number(a.startTime))
      .slice(0, 3);
    
    const secondary = recentEntries.length > 0
      ? `Recent: ${recentEntries[0].title.substring(0, 40)}${recentEntries[0].title.length > 40 ? '...' : ''}`
      : undefined;

    return { stats, secondary, isEmpty, total, upcoming, today, recentEntries };
  }

  return { stats, isEmpty, total, upcoming, today };
}

export function computeBudgetSummary(items: BudgetItem[], mode: SummaryMode = 'stats'): BudgetSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthItems = items.filter((item) => {
    const itemDate = new Date(Number(item.date) / 1000000);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  const incomeAmount = currentMonthItems
    .filter((item) => item.itemType === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expensesAmount = currentMonthItems
    .filter((item) => item.itemType === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const netAmount = incomeAmount - expensesAmount;

  const income = formatCentsAsCurrency(incomeAmount);
  const expenses = formatCentsAsCurrency(expensesAmount);
  const net = formatCentsAsCurrency(netAmount);
  const isEmpty = items.length === 0;

  const stats = [
    { label: 'Income', value: income },
    { label: 'Expenses', value: expenses },
    { label: 'Net', value: net },
  ];

  if (mode === 'recent') {
    const recentItems = [...items]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .slice(0, 3);
    
    const secondary = recentItems.length > 0
      ? `Recent: ${recentItems[0].description.substring(0, 40)}${recentItems[0].description.length > 40 ? '...' : ''}`
      : undefined;

    return { stats, secondary, isEmpty, income, expenses, net, recentItems };
  }

  return { stats, isEmpty, income, expenses, net };
}
