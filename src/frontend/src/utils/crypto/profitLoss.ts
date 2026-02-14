import type { CryptoEntry } from '@/backend';

export interface AssetProfitLoss {
  symbol: string;
  profitLossUSD: number;
  profitLossPercent: number;
  status: 'positive' | 'negative' | 'flat';
}

export function computeEntryProfitLoss(
  entry: CryptoEntry,
  livePrice?: number
): number {
  const amountInUnits = Number(entry.amount) / 1000000;
  const purchasePrice = Number(entry.purchasePriceCents) / 100;
  const currentPrice = livePrice ?? Number(entry.currentPriceCents) / 100;
  
  return (currentPrice - purchasePrice) * amountInUnits;
}

export function computeAssetProfitLoss(
  entries: CryptoEntry[],
  livePrices?: Record<string, number>
): AssetProfitLoss[] {
  const assetMap = new Map<string, { totalPL: number; totalInvested: number }>();
  
  for (const entry of entries) {
    const symbol = entry.symbol.toUpperCase();
    const livePrice = livePrices?.[symbol];
    const pl = computeEntryProfitLoss(entry, livePrice);
    
    const amountInUnits = Number(entry.amount) / 1000000;
    const purchasePrice = Number(entry.purchasePriceCents) / 100;
    const invested = amountInUnits * purchasePrice;
    
    const existing = assetMap.get(symbol) || { totalPL: 0, totalInvested: 0 };
    assetMap.set(symbol, {
      totalPL: existing.totalPL + pl,
      totalInvested: existing.totalInvested + invested,
    });
  }
  
  const result: AssetProfitLoss[] = [];
  for (const [symbol, data] of assetMap.entries()) {
    const profitLossPercent = data.totalInvested > 0 ? (data.totalPL / data.totalInvested) * 100 : 0;
    result.push({
      symbol,
      profitLossUSD: data.totalPL,
      profitLossPercent,
      status: data.totalPL > 0.01 ? 'positive' : data.totalPL < -0.01 ? 'negative' : 'flat',
    });
  }
  
  return result.sort((a, b) => b.profitLossUSD - a.profitLossUSD);
}

export function computeTotalPortfolioProfitLoss(
  entries: CryptoEntry[],
  livePrices?: Record<string, number>
): number {
  return entries.reduce((sum, entry) => {
    const livePrice = livePrices?.[entry.symbol.toUpperCase()];
    return sum + computeEntryProfitLoss(entry, livePrice);
  }, 0);
}
