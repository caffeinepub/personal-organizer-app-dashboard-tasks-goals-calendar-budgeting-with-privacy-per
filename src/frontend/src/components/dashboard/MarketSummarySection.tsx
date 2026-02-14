import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import { useMarketSummary } from '@/hooks/market/useMarketSummary';

export default function MarketSummarySection() {
  const { crypto, stocks, commodities } = useMarketSummary();

  const renderTable = (
    title: string,
    icon: React.ReactNode,
    data: any[] | undefined,
    isLoading: boolean,
    isError: boolean
  ) => (
    <Card className="settings-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !data || data.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Unable to load {title.toLowerCase()} data
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((asset, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{asset.name}</div>
                </div>
                <div className="text-sm font-semibold">
                  {asset.price > 0 ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Market Summary</h2>
        <p className="text-muted-foreground text-sm">Top 10 assets by market cap</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {renderTable('Crypto', <TrendingUp className="h-4 w-4 text-chart-1" />, crypto.data, crypto.isLoading, crypto.isError)}
        {renderTable('Stocks', <BarChart3 className="h-4 w-4 text-chart-2" />, stocks.data, stocks.isLoading, stocks.isError)}
        {renderTable('Commodities', <DollarSign className="h-4 w-4 text-chart-3" />, commodities.data, commodities.isLoading, commodities.isError)}
      </div>
    </div>
  );
}
