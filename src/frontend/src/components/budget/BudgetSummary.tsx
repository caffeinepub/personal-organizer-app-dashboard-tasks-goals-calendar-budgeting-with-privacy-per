import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BudgetItem } from '@/backend';
import { useMemo } from 'react';
import { formatCentsAsCurrency } from '@/utils/money';
import { useBudgetSummaryPeriod } from '@/hooks/budget/useBudgetSummaryPeriod';

interface BudgetSummaryProps {
  items: BudgetItem[];
}

export default function BudgetSummary({ items }: BudgetSummaryProps) {
  const { period, setPeriod } = useBudgetSummaryPeriod();

  const summary = useMemo(() => {
    let filteredItems = items;

    if (period === 'month') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filteredItems = items.filter((item) => {
        const itemDate = new Date(Number(item.date) / 1000000);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
    }

    const income = filteredItems
      .filter((item) => item.itemType === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = filteredItems
      .filter((item) => item.itemType === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const net = income - expenses;

    return { income, expenses, net };
  }, [items, period]);

  const periodLabel = period === 'month' ? 'This month' : 'All time';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Summary</h2>
        <Select value={period} onValueChange={(value: 'month' | 'all') => setPeriod(value)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{formatCentsAsCurrency(summary.income)}</div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-5">{formatCentsAsCurrency(summary.expenses)}</div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-chart-1' : 'text-chart-5'}`}>
              {formatCentsAsCurrency(summary.net)}
            </div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
