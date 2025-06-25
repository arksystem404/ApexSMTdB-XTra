import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, TrendingUp, TrendingDown, Eye, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StockDetailModal } from './stock-detail-modal';

export function StockScreener() {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minVolume: '',
    maxVolume: '',
    minPE: '',
    maxPE: '',
    minPB: '',
    maxPB: '',
    minDividendYield: '',
    maxDividendYield: '',
    minMarketCap: '',
    maxMarketCap: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'symbol',
    direction: 'asc'
  });

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/market/data'],
    refetchInterval: 30000,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  // Process and filter market data based on current filters
  const getFilteredStocks = () => {
    if (!marketData?.shareMarketData) return [];
    
    let stocks = marketData.shareMarketData
      .map((stock: any) => {
        const price = parseFloat(stock.sPrice) / 100 || 0;
        const eps = parseFloat(stock.sEPS) / 100 || 0;
        const bookValue = parseFloat(stock.sBV) / 100 || 0;
        const dividend = parseFloat(stock.sLD) / 100 || 0;
        const sharesOutstanding = parseInt(stock.sTS) || 0;
        
        return {
          symbol: stock.sName || stock.symbol || 'N/A',
          companyName: stock.sCompanyName || stock.companyName || stock.sName || 'N/A',
          price,
          change: parseFloat(stock.sChange) / 100 || 0,
          changePercent: parseFloat(stock.sChangePercent) || parseFloat(stock.sChange) || 0,
          volume: parseInt(stock.sVolume) || 0,
          marketCap: price * sharesOutstanding,
          pe: eps > 0 ? price / eps : null,
          pb: bookValue > 0 ? price / bookValue : null,
          dividendYield: dividend > 0 ? (dividend / price) * 100 : null,
          eps,
          bookValue,
          dividend,
          industry: stock.iID || 'N/A',
        };
      })
      .filter((stock: any) => {
        // Apply search filter
        if (searchQuery && !stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Apply numeric filters
        if (filters.minPrice && stock.price < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && stock.price > parseFloat(filters.maxPrice)) return false;
        if (filters.minVolume && stock.volume < parseInt(filters.minVolume)) return false;
        if (filters.maxVolume && stock.volume > parseInt(filters.maxVolume)) return false;
        if (filters.minPE && (!stock.pe || stock.pe < parseFloat(filters.minPE))) return false;
        if (filters.maxPE && (!stock.pe || stock.pe > parseFloat(filters.maxPE))) return false;
        if (filters.minPB && (!stock.pb || stock.pb < parseFloat(filters.minPB))) return false;
        if (filters.maxPB && (!stock.pb || stock.pb > parseFloat(filters.maxPB))) return false;
        if (filters.minDividendYield && (!stock.dividendYield || stock.dividendYield < parseFloat(filters.minDividendYield))) return false;
        if (filters.maxDividendYield && (!stock.dividendYield || stock.dividendYield > parseFloat(filters.maxDividendYield))) return false;
        if (filters.minMarketCap && stock.marketCap < parseFloat(filters.minMarketCap)) return false;
        if (filters.maxMarketCap && stock.marketCap > parseFloat(filters.maxMarketCap)) return false;
        
        return true;
      });

    // Apply sorting
    stocks.sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    });

    return stocks.slice(0, 100); // Limit results
  };

  const filteredStocks = getFilteredStocks();

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minVolume: '',
      maxVolume: '',
      minPE: '',
      maxPE: '',
      minPB: '',
      maxPB: '',
      minDividendYield: '',
      maxDividendYield: '',
      minMarketCap: '',
      maxMarketCap: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <Card className="theme-card theme-border">
        <CardHeader>
          <CardTitle className="flex items-center theme-text">
            <Search className="w-5 h-5 mr-2" />
            Advanced Stock Screener
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 theme-text-muted" />
            <Input
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 theme-surface theme-border theme-text"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium theme-text">Price Range</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium theme-text">P/E Ratio</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPE}
                  onChange={(e) => handleFilterChange('minPE', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPE}
                  onChange={(e) => handleFilterChange('maxPE', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium theme-text">P/B Ratio</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPB}
                  onChange={(e) => handleFilterChange('minPB', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPB}
                  onChange={(e) => handleFilterChange('maxPB', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium theme-text">Dividend Yield (%)</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minDividendYield}
                  onChange={(e) => handleFilterChange('minDividendYield', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDividendYield}
                  onChange={(e) => handleFilterChange('maxDividendYield', e.target.value)}
                  className="theme-surface theme-border theme-text"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="theme-surface theme-border theme-text"
            >
              Clear Filters
            </Button>
            <Badge variant="secondary" className="theme-accent text-white">
              {filteredStocks.length} stocks found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="theme-card theme-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="theme-border border-b">
                    <TableHead 
                      className="theme-text-muted cursor-pointer hover:theme-text"
                      onClick={() => handleSort('symbol')}
                    >
                      Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="theme-text-muted">Company</TableHead>
                    <TableHead 
                      className="theme-text-muted text-right cursor-pointer hover:theme-text"
                      onClick={() => handleSort('price')}
                    >
                      Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="theme-text-muted text-right cursor-pointer hover:theme-text"
                      onClick={() => handleSort('changePercent')}
                    >
                      Change {sortConfig.key === 'changePercent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="theme-text-muted text-right cursor-pointer hover:theme-text"
                      onClick={() => handleSort('pe')}
                    >
                      P/E {sortConfig.key === 'pe' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="theme-text-muted text-right cursor-pointer hover:theme-text"
                      onClick={() => handleSort('dividendYield')}
                    >
                      Div. Yield {sortConfig.key === 'dividendYield' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="theme-text-muted text-right cursor-pointer hover:theme-text"
                      onClick={() => handleSort('volume')}
                    >
                      Volume {sortConfig.key === 'volume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="theme-text-muted text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock: any, index) => (
                    <TableRow key={`${stock.symbol}-${index}`} className="theme-border border-b hover:theme-surface">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-blue-600">
                            {stock.symbol.charAt(0)}
                          </div>
                          <span className="font-mono font-medium theme-text">{stock.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm theme-text max-w-32 truncate">{stock.companyName}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-medium theme-text">
                          ${formatCurrency(stock.price)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`font-mono font-medium ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm theme-text-muted">
                          {stock.pe ? stock.pe.toFixed(1) : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm theme-text-muted">
                          {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm theme-text-muted">
                          {formatLargeNumber(stock.volume)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStock(stock.symbol)}
                          className="theme-text hover:theme-accent hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          symbol={selectedStock}
        />
      )}
    </div>
  );
}