import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Coins, DollarSign } from 'lucide-react';
import type { CryptoEntry } from '@/backend';

interface CryptoSummaryProps {
  entries: CryptoEntry[];
}

export default function CryptoSummary({ entries }: CryptoSummaryProps) {
  const totalPositions = entries.length;
  
  const uniqueAssets = new Set(entries.map(e => e.symbol.toUpperCase())).size;
  
  const totalValue = entries.reduce((sum, entry) => {
    return sum + (Number(entry.amount) * Number(entry.currentPriceCents)) / 100;
  }, 0);

  const stats = [
    {
      title: 'Total Positions',
      value: totalPositions.toString(),
      icon: Coins,
      color: 'text-chart-1',
    },
    {
      title: 'Unique Assets',
      value: uniqueAssets.toString(),
      icon: TrendingUp,
      color: 'text-chart-2',
    },
    {
      title: 'Portfolio Value',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(totalValue),
      icon: DollarSign,
      color: 'text-chart-3',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="crypto-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
