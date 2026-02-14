import type { Task, Goal, CalendarEntry, BudgetItem } from '@/backend';
import { SectionSummaryBlock } from './SectionSummaryBlock';
import {
  computeTasksSummary,
  computeGoalsSummary,
  computeCalendarSummary,
  computeBudgetSummary,
} from '@/utils/dashboard/summaryComputations';
import type { DashboardPreferences } from '@/hooks/dashboard/useDashboardSummaryPreferences';
import { CheckSquare, Target, Calendar, Wallet } from 'lucide-react';

interface DashboardSummariesProps {
  tasks: Task[];
  goals: Goal[];
  calendarEntries: CalendarEntry[];
  budgetItems: BudgetItem[];
  preferences: DashboardPreferences;
  isLoading: {
    tasks: boolean;
    goals: boolean;
    calendar: boolean;
    budget: boolean;
  };
}

export function DashboardSummaries({
  tasks,
  goals,
  calendarEntries,
  budgetItems,
  preferences,
  isLoading,
}: DashboardSummariesProps) {
  const tasksSummary = computeTasksSummary(tasks, preferences.tasks.mode);
  const goalsSummary = computeGoalsSummary(goals, preferences.goals.mode);
  const calendarSummary = computeCalendarSummary(calendarEntries, preferences.calendar.mode);
  const budgetSummary = computeBudgetSummary(budgetItems, preferences.budget.mode);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {preferences.tasks.enabled && (
          <SectionSummaryBlock
            title="Tasks"
            icon={CheckSquare}
            stats={tasksSummary.stats}
            secondary={tasksSummary.secondary}
            isEmpty={tasksSummary.isEmpty}
            isLoading={isLoading.tasks}
            emptyMessage="No tasks yet"
            color="text-chart-1"
          />
        )}

        {preferences.goals.enabled && (
          <SectionSummaryBlock
            title="Goals"
            icon={Target}
            stats={goalsSummary.stats}
            secondary={goalsSummary.secondary}
            isEmpty={goalsSummary.isEmpty}
            isLoading={isLoading.goals}
            emptyMessage="No goals yet"
            color="text-chart-2"
          />
        )}

        {preferences.calendar.enabled && (
          <SectionSummaryBlock
            title="Calendar"
            icon={Calendar}
            stats={calendarSummary.stats}
            secondary={calendarSummary.secondary}
            isEmpty={calendarSummary.isEmpty}
            isLoading={isLoading.calendar}
            emptyMessage="No events yet"
            color="text-chart-3"
          />
        )}

        {preferences.budget.enabled && (
          <SectionSummaryBlock
            title="Budget"
            icon={Wallet}
            stats={budgetSummary.stats}
            secondary={budgetSummary.secondary}
            isEmpty={budgetSummary.isEmpty}
            isLoading={isLoading.budget}
            emptyMessage="No budget items yet"
            color="text-chart-4"
          />
        )}
      </div>
    </div>
  );
}
