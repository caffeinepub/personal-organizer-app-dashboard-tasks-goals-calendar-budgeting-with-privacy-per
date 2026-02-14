import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Target, Calendar, Wallet, Coins } from 'lucide-react';
import { useGetTasks } from '@/hooks/tasks/useTasks';
import { useGetGoals } from '@/hooks/goals/useGoals';
import { useGetCalendarEntries } from '@/hooks/calendar/useCalendar';
import { useGetBudgetItems } from '@/hooks/budget/useBudget';
import { DashboardSummaries } from '@/components/dashboard/DashboardSummaries';
import { DashboardSummarySettingsDropdown } from '@/components/dashboard/DashboardSummarySettingsDropdown';
import { useDashboardSummaryPreferences } from '@/hooks/dashboard/useDashboardSummaryPreferences';
import MarketSummarySection from '@/components/dashboard/MarketSummarySection';

const sections = [
  {
    to: '/tasks',
    title: 'Tasks',
    description: 'Manage your daily tasks',
    icon: '/assets/generated/icon-tasks.dim_256x256.png',
    IconComponent: CheckSquare,
    color: 'text-chart-1',
  },
  {
    to: '/goals',
    title: 'Goals',
    description: 'Track your progress',
    icon: '/assets/generated/icon-goals.dim_256x256.png',
    IconComponent: Target,
    color: 'text-chart-2',
  },
  {
    to: '/calendar',
    title: 'Calendar',
    description: 'Schedule your events',
    icon: '/assets/generated/icon-calendar.dim_256x256.png',
    IconComponent: Calendar,
    color: 'text-chart-3',
  },
  {
    to: '/budget',
    title: 'Budget',
    description: 'Track income & expenses',
    icon: '/assets/generated/icon-budget.dim_256x256.png',
    IconComponent: Wallet,
    color: 'text-chart-4',
  },
  {
    to: '/crypto',
    title: 'Crypto',
    description: 'Manage your portfolio',
    IconComponent: Coins,
    color: 'text-chart-5',
  },
];

export default function DashboardPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: goals = [], isLoading: goalsLoading } = useGetGoals();
  const { data: calendarEntries = [], isLoading: calendarLoading } = useGetCalendarEntries();
  const { data: budgetItems = [], isLoading: budgetLoading } = useGetBudgetItems();

  const { preferences, toggleSection, setMode } = useDashboardSummaryPreferences();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Your everything tracker at a glance.
          </p>
        </div>
        <DashboardSummarySettingsDropdown
          preferences={preferences}
          onToggleSection={toggleSection}
          onSetMode={setMode}
        />
      </div>

      <DashboardSummaries
        tasks={tasks}
        goals={goals}
        calendarEntries={calendarEntries}
        budgetItems={budgetItems}
        preferences={preferences}
        isLoading={{
          tasks: tasksLoading,
          goals: goalsLoading,
          calendar: calendarLoading,
          budget: budgetLoading,
        }}
      />

      <MarketSummarySection />

      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Quick Access</h2>
        <p className="text-muted-foreground text-sm">Jump to any section</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.to} to={section.to} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer settings-card">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-center">
                  {section.icon ? (
                    <img
                      src={section.icon}
                      alt={section.title}
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <section.IconComponent className={`h-16 w-16 ${section.color}`} />
                  )}
                </div>
                <div className="space-y-0.5 text-center">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-xs">{section.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
