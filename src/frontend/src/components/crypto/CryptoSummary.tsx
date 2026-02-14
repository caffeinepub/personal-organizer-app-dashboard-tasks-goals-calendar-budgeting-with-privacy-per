import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Coins, DollarSign, TrendingDown } from 'lucide-react';
import { useCryptoLivePrices } from '@/hooks/crypto/useCryptoLivePrices';
import type { CryptoEntry } from '@/backend';
import { computeTotalPortfolioProfitLoss, computeAssetProfitLoss } from '@/utils/crypto/profitLoss';

interface CryptoSummaryProps {
  entries: CryptoEntry[];
}

export default function CryptoSummary({ entries }: CryptoSummaryProps) {
  const symbols = entries.map((e) => e.symbol);
  const { data: livePrices } = useCryptoLivePrices(symbols);

  const totalPositions = entries.length;
  
  const getCurrentPrice = (entry: CryptoEntry): number => {
    const livePrice = livePrices?.[entry.symbol.toUpperCase()];
    if (livePrice) {
      return livePrice;
    }
    return Number(entry.currentPriceCents) / 100;
  };

  const totalValue = entries.reduce((sum, entry) => {
    const amountInUnits = Number(entry.amount) / 1000000;
    const currentPrice = getCurrentPrice(entry);
    return sum + (amountInUnits * currentPrice);
  }, 0);

  const totalProfitLoss = computeTotalPortfolioProfitLoss(entries, livePrices);
  const assetProfitLoss = computeAssetProfitLoss(entries, livePrices);

  const stats = [
    {
      title: 'Total Positions',
      value: totalPositions.toString(),
      icon: Coins,
      color: 'text-chart-1',
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
    {
      title: 'Total P/L',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        signDisplay: 'always',
      }).format(totalProfitLoss),
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      color: totalProfitLoss >= 0 ? 'text-profit' : 'text-loss',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.title === 'Total P/L' ? stat.color : ''}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assetProfitLoss.length > 0 && (
        <Card className="crypto-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profit Status by Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assetProfitLoss.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{asset.symbol}</div>
                    {asset.status === 'positive' && <TrendingUp className="h-3.5 w-3.5 text-profit" />}
                    {asset.status === 'negative' && <TrendingDown className="h-3.5 w-3.5 text-loss" />}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${asset.status === 'positive' ? 'text-profit' : asset.status === 'negative' ? 'text-loss' : 'text-muted-foreground'}`}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        signDisplay: 'always',
                      }).format(asset.profitLossUSD)}
                    </div>
                    <div className={`text-xs ${asset.status === 'positive' ? 'text-profit' : asset.status === 'negative' ? 'text-loss' : 'text-muted-foreground'}`}>
                      {asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
