import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Search, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StockDetailModal } from './stock-detail-modal';

interface Stock {
  sID: string;
  n: string;
  lp: number;
  lm: number;
  v: number;
  leps: number;
  bv: number;
  ts: number;
  ld: number;
  iID: string;
}

export function MarketOverview() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterSector, setFilterSector] = useState('');


  const { data: marketData, isLoading, error } = useQuery({
    queryKey: ['/api/market/data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stocks: Stock[] = marketData?.sharemarket || [];
  const sectors = [...new Set(stocks.map(stock => stock.iID).filter(Boolean))];

  // Filter and sort stocks
  const filteredStocks = stocks
    .filter(stock => {
      const matchesSearch = 
        stock.sID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.n.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = !filterSector || stock.iID === filterSector;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'symbol':
          aValue = a.sID;
          bValue = b.sID;
          break;
        case 'price':
          aValue = a.lp / 100;
          bValue = b.lp / 100;
          break;
        case 'change':
          aValue = a.lm / 100;
          bValue = b.lm / 100;
          break;
        case 'volume':
          aValue = a.v;
          bValue = b.v;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }
      
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-red-500 mb-2">Market Data Error</h3>
          <p className="text-sm text-muted-foreground">Failed to load market data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Stock Market</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredStocks.length} stocks available • Real-time data
            </p>
          </div>
          <Badge variant="outline">
            Live Market
          </Badge>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground text-sm"
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border rounded-md bg-background text-foreground text-sm"
            >
              <option value="symbol-asc">Symbol A-Z</option>
              <option value="symbol-desc">Symbol Z-A</option>
              <option value="price-desc">Price High-Low</option>
              <option value="price-asc">Price Low-High</option>
              <option value="change-desc">Biggest Gainers</option>
              <option value="change-asc">Biggest Losers</option>
              <option value="volume-desc">Volume High-Low</option>
            </select>
          </div>
        </div>

        {/* Stock List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No stocks found matching your criteria.</p>
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const price = stock.lp / 100;
              const change = stock.lm / 100;
              const changePercent = price > 0 ? (change / price) * 100 : 0;
              
              return (
                <div
                  key={stock.sID}
                  onClick={() => setSelectedStock(stock.sID)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{stock.sID}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {stock.n}
                        </p>
                        {stock.iID && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {stock.iID}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-bold text-foreground text-lg">
                        {formatCurrency(stock.lp)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${getChangeColor(change)}`}>
                        {getChangeIcon(change)}
                        <span>{formatCurrency(Math.abs(stock.lm))}</span>
                        <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="font-medium text-foreground">{formatNumber(stock.v)}</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStock(stock.sID);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Stock Detail Modal */}
      <StockDetailModal
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        symbol={selectedStock || ''}
      />
    </>
  );
}