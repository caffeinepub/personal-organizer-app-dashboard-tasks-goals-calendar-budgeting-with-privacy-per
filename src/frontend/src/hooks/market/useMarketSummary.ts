import { useQuery } from '@tanstack/react-query';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
}

async function fetchTopCrypto(): Promise<MarketAsset[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    );
    if (!response.ok) throw new Error('Failed to fetch crypto data');
    const data = await response.json();
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
    }));
  } catch (error) {
    console.error('Error fetching crypto:', error);
    return [];
  }
}

async function fetchTopStocks(): Promise<MarketAsset[]> {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 0 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 0 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 0 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 0 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 0 },
    { symbol: 'META', name: 'Meta Platforms', price: 0 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 0 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 0 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 0 },
    { symbol: 'V', name: 'Visa Inc.', price: 0 },
  ];
}

async function fetchTopCommodities(): Promise<MarketAsset[]> {
  return [
    { symbol: 'GC', name: 'Gold', price: 0 },
    { symbol: 'SI', name: 'Silver', price: 0 },
    { symbol: 'CL', name: 'Crude Oil', price: 0 },
    { symbol: 'NG', name: 'Natural Gas', price: 0 },
    { symbol: 'HG', name: 'Copper', price: 0 },
    { symbol: 'PL', name: 'Platinum', price: 0 },
    { symbol: 'PA', name: 'Palladium', price: 0 },
    { symbol: 'ZW', name: 'Wheat', price: 0 },
    { symbol: 'ZC', name: 'Corn', price: 0 },
    { symbol: 'ZS', name: 'Soybeans', price: 0 },
  ];
}

export function useMarketSummary() {
  const cryptoQuery = useQuery({
    queryKey: ['market', 'crypto'],
    queryFn: fetchTopCrypto,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const stocksQuery = useQuery({
    queryKey: ['market', 'stocks'],
    queryFn: fetchTopStocks,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const commoditiesQuery = useQuery({
    queryKey: ['market', 'commodities'],
    queryFn: fetchTopCommodities,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    crypto: cryptoQuery,
    stocks: stocksQuery,
    commodities: commoditiesQuery,
  };
}
