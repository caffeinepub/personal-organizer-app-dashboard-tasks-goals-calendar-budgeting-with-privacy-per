import { useQuery } from '@tanstack/react-query';

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd: number;
  };
}

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ICP: 'internet-computer',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  SOL: 'solana',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  XLM: 'stellar',
  ALGO: 'algorand',
};

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().trim();
}

function getCoinGeckoId(symbol: string): string | null {
  const normalized = normalizeSymbol(symbol);
  return SYMBOL_TO_COINGECKO_ID[normalized] || null;
}

export function useCryptoLivePrice(symbol: string) {
  const coinId = getCoinGeckoId(symbol);

  return useQuery<number | null>({
    queryKey: ['cryptoPrice', symbol],
    queryFn: async () => {
      if (!coinId) {
        throw new Error(`Unsupported symbol: ${symbol}`);
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      const data: CoinGeckoPriceResponse = await response.json();
      
      if (!data[coinId] || typeof data[coinId].usd !== 'number') {
        throw new Error('Invalid price data');
      }

      return data[coinId].usd;
    },
    enabled: !!coinId && !!symbol,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

export function useCryptoLivePrices(symbols: string[]) {
  const uniqueSymbols = Array.from(new Set(symbols.map(normalizeSymbol)));
  const coinIds = uniqueSymbols
    .map(getCoinGeckoId)
    .filter((id): id is string => id !== null);

  return useQuery<Record<string, number>>({
    queryKey: ['cryptoPrices', uniqueSymbols.sort().join(',')],
    queryFn: async () => {
      if (coinIds.length === 0) {
        return {};
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data: CoinGeckoPriceResponse = await response.json();
      
      // Map back to symbols
      const priceMap: Record<string, number> = {};
      uniqueSymbols.forEach((symbol) => {
        const coinId = getCoinGeckoId(symbol);
        if (coinId && data[coinId] && typeof data[coinId].usd === 'number') {
          priceMap[symbol] = data[coinId].usd;
        }
      });

      return priceMap;
    },
    enabled: coinIds.length > 0,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}
