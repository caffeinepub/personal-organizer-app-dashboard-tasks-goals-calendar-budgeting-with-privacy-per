import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { BudgetItem } from '@/backend';
import { useMemo } from 'react';

interface BudgetSummaryProps {
  items: BudgetItem[];
}

export default function BudgetSummary({ items }: BudgetSummaryProps) {
  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthItems = items.filter((item) => {
      const itemDate = new Date(Number(item.date) / 1000000);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const income = currentMonthItems
      .filter((item) => item.itemType === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = currentMonthItems
      .filter((item) => item.itemType === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const net = income - expenses;

    return { income, expenses, net };
  }, [items]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-1">{formatAmount(summary.income)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-chart-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-5">{formatAmount(summary.expenses)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-chart-1' : 'text-chart-5'}`}>
            {formatAmount(summary.net)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
}
