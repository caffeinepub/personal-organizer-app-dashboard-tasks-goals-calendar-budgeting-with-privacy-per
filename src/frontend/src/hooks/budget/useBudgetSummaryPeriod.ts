import { useState, useEffect } from 'react';

export type BudgetSummaryPeriod = 'month' | 'all';

const STORAGE_KEY = 'budget-summary-period';

export function useBudgetSummaryPeriod() {
  const [period, setPeriodState] = useState<BudgetSummaryPeriod>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'all' || stored === 'month') ? stored : 'month';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, period);
  }, [period]);

  return {
    period,
    setPeriod: setPeriodState,
  };
}
