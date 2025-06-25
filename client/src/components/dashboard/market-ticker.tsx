import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketTickerData } from '@shared/schema';

export function MarketTicker() {
  const { data: tickerData = [] } = useQuery<MarketTickerData[]>({
    queryKey: ['/api/market/ticker'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!tickerData.length) {
    return (
      <div className="hidden lg:flex items-center space-x-6 overflow-hidden w-96">
        <div className="text-sm theme-text-muted">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center space-x-6 overflow-hidden w-96">
      <div className="stock-ticker flex space-x-8 whitespace-nowrap">
        {tickerData.map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2">
            <span className="font-mono font-medium theme-text">{stock.symbol}</span>
            <div className="flex items-center space-x-1">
              {stock.changePercent >= 0 ? (
                <TrendingUp className="w-4 h-4 theme-success" />
              ) : (
                <TrendingDown className="w-4 h-4 theme-danger" />
              )}
              <span className={`font-mono font-medium ${stock.changePercent >= 0 ? 'theme-success' : 'theme-danger'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
