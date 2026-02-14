import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, ErrorComponent } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import BudgetPage from './pages/BudgetPage';
import CryptoPage from './pages/CryptoPage';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/auth/RequireAuth';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <RequireAuth />
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground text-center max-w-md">
        {error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
      </p>
      <ErrorComponent error={error} />
    </div>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
});

const budgetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budget',
  component: BudgetPage,
});

const cryptoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crypto',
  component: CryptoPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  tasksRoute,
  goalsRoute,
  calendarRoute,
  budgetRoute,
  cryptoRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
