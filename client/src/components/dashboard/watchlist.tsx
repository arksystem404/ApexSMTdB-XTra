import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, Plus, Eye, HeartOff, TrendingUp, TrendingDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { WatchlistItem, StockData } from '@shared/schema';

const MOCK_USER_ID = 1; // For demo purposes

export function Watchlist() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const queryClient = useQueryClient();

  const { data: watchlistItems = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: [`/api/watchlist/${MOCK_USER_ID}`],
    refetchInterval: 60000, // Refresh every minute
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (stock: { symbol: string; companyName: string }) => {
      return apiRequest('POST', '/api/watchlist', {
        userId: MOCK_USER_ID,
        symbol: stock.symbol,
        companyName: stock.companyName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${MOCK_USER_ID}`] });
      setIsAddDialogOpen(false);
      setSearchSymbol('');
      setSearchResults([]);
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/watchlist/${id}/${MOCK_USER_ID}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${MOCK_USER_ID}`] });
    },
  });

  const searchStocks = async () => {
    if (!searchSymbol.trim()) return;
    
    try {
      // Use live market data for search
      if (marketData && marketData.shareMarketData) {
        const filtered = marketData.shareMarketData
          .filter((stock: any) => {
            const symbol = stock.sName || stock.symbol || '';
            const companyName = stock.sCompanyName || stock.companyName || stock.sName || '';
            return symbol.toLowerCase().includes(searchSymbol.toLowerCase()) ||
                   companyName.toLowerCase().includes(searchSymbol.toLowerCase());
          })
          .slice(0, 10)
          .map((stock: any) => ({
            symbol: stock.sName || stock.symbol || 'N/A',
            companyName: stock.sCompanyName || stock.companyName || stock.sName || 'N/A',
            price: parseFloat(stock.sPrice) / 100 || 0,
            change: parseFloat(stock.sChange) / 100 || 0,
            changePercent: parseFloat(stock.sChangePercent) || parseFloat(stock.sChange) || 0,
            volume: parseInt(stock.sVolume) || 0,
          }));
        
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Failed to search stocks:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStocks();
    }
  };

  // Get live stock data from SMT API
  const { data: marketData } = useQuery({
    queryKey: ['/api/market/data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStockData = (symbol: string): StockData => {
    if (marketData && marketData.shareMarketData) {
      const stock = marketData.shareMarketData.find((s: any) => 
        (s.sName || s.symbol) === symbol
      );
      
      if (stock) {
        return {
          symbol: stock.sName || stock.symbol || symbol,
          companyName: stock.sCompanyName || stock.companyName || stock.sName || 'Unknown Company',
          price: parseFloat(stock.sPrice) / 100 || 0,
          change: parseFloat(stock.sChange) / 100 || 0,
          changePercent: parseFloat(stock.sChangePercent) || parseFloat(stock.sChange) || 0,
          volume: parseInt(stock.sVolume) || 0,
          marketCap: parseFloat(stock.sMarketCap) || undefined,
          pe: parseFloat(stock.sPE) / 100 || undefined,
          pb: parseFloat(stock.sPB) / 100 || undefined,
          dividendYield: parseFloat(stock.sDividendYield) / 100 || undefined,
        };
      }
    }
    
    // Fallback if stock not found in current market data
    return { 
      symbol, 
      companyName: 'Loading...', 
      price: 0, 
      change: 0, 
      changePercent: 0, 
      volume: 0 
    };
  };

  if (isLoading) {
    return (
      <div className="theme-card theme-border border rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 theme-border bg-current opacity-20 rounded"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 theme-border bg-current opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card theme-border border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg theme-accent flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold theme-text">Watchlist</h3>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="theme-accent text-white hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="theme-card theme-border">
            <DialogHeader>
              <DialogTitle className="theme-text">Add Stock to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by symbol or company name..."
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="theme-surface theme-border theme-text"
                />
                <Button onClick={searchStocks} className="theme-accent text-white">
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 rounded-lg theme-surface theme-border border"
                    >
                      <div>
                        <div className="font-medium theme-text">{stock.symbol}</div>
                        <div className="text-sm theme-text-muted">{stock.companyName}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToWatchlistMutation.mutate({
                          symbol: stock.symbol,
                          companyName: stock.companyName,
                        })}
                        disabled={addToWatchlistMutation.isPending}
                        className="theme-accent text-white"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {watchlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 theme-text-muted mx-auto mb-4" />
          <h4 className="text-lg font-medium theme-text mb-2">No stocks in watchlist</h4>
          <p className="theme-text-muted mb-4">Add stocks to track their performance</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="theme-accent text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Stock
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="theme-border border-b">
                <TableHead className="theme-text-muted">Symbol</TableHead>
                <TableHead className="theme-text-muted">Company</TableHead>
                <TableHead className="theme-text-muted text-right">Price</TableHead>
                <TableHead className="theme-text-muted text-right">Change</TableHead>
                <TableHead className="theme-text-muted text-right">Volume</TableHead>
                <TableHead className="theme-text-muted text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlistItems.map((item) => {
                const stockData = getStockData(item.symbol);
                return (
                  <TableRow key={item.id} className="theme-border border-b hover:theme-surface group">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-blue-600">
                          {item.symbol.charAt(0)}
                        </div>
                        <span className="font-mono font-medium theme-text">{item.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm theme-text">{item.companyName}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium theme-text">
                        ${stockData.price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {stockData.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 theme-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 theme-danger" />
                        )}
                        <span className={`font-mono font-medium ${stockData.changePercent >= 0 ? 'theme-success' : 'theme-danger'}`}>
                          {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-sm theme-text-muted">
                        {(stockData.volume / 1000000).toFixed(1)}M
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="theme-accent-text">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="theme-danger"
                          onClick={() => removeFromWatchlistMutation.mutate(item.id)}
                          disabled={removeFromWatchlistMutation.isPending}
                        >
                          <HeartOff className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
