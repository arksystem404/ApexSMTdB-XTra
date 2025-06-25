import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { StockData } from '@shared/schema';

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
  });

  const [results, setResults] = useState<StockData[]>([]);

  const screenMutation = useMutation({
    mutationFn: async (filterData: typeof filters) => {
      const response = await apiRequest('POST', '/api/stocks/screen', {
        minPrice: filterData.minPrice ? parseFloat(filterData.minPrice) : undefined,
        maxPrice: filterData.maxPrice ? parseFloat(filterData.maxPrice) : undefined,
        minVolume: filterData.minVolume ? parseInt(filterData.minVolume) : undefined,
        maxVolume: filterData.maxVolume ? parseInt(filterData.maxVolume) : undefined,
        minPE: filterData.minPE ? parseFloat(filterData.minPE) : undefined,
        maxPE: filterData.maxPE ? parseFloat(filterData.maxPE) : undefined,
        minPB: filterData.minPB ? parseFloat(filterData.minPB) : undefined,
        maxPB: filterData.maxPB ? parseFloat(filterData.maxPB) : undefined,
        minDividendYield: filterData.minDividendYield ? parseFloat(filterData.minDividendYield) : undefined,
        maxDividendYield: filterData.maxDividendYield ? parseFloat(filterData.maxDividendYield) : undefined,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRunScreener = () => {
    screenMutation.mutate(filters);
  };

  const resetFilters = () => {
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
    });
    setResults([]);
  };

  return (
    <div className="theme-card theme-border border rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg theme-accent flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold theme-text">Stock Screener</h3>
      </div>
      
      {/* Filter Controls */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min P/E Ratio"
            value={filters.minPE}
            onChange={(e) => handleFilterChange('minPE', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
          <Input
            type="number"
            placeholder="Max P/E Ratio"
            value={filters.maxPE}
            onChange={(e) => handleFilterChange('maxPE', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min Volume (M)"
            value={filters.minVolume}
            onChange={(e) => handleFilterChange('minVolume', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
          <Input
            type="number"
            placeholder="Max Volume (M)"
            value={filters.maxVolume}
            onChange={(e) => handleFilterChange('maxVolume', e.target.value)}
            className="theme-surface theme-border theme-text"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleRunScreener}
            disabled={screenMutation.isPending}
            className="theme-accent text-white hover:opacity-90 flex-1"
          >
            <Filter className="w-4 h-4 mr-2" />
            {screenMutation.isPending ? 'Screening...' : 'Run Screener'}
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="theme-surface theme-border theme-text"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium theme-text">Screening Results</h4>
            <Badge variant="secondary" className="theme-accent text-white">
              {results.length} stocks found
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="theme-border border-b">
                  <TableHead className="theme-text-muted">Symbol</TableHead>
                  <TableHead className="theme-text-muted">Company</TableHead>
                  <TableHead className="theme-text-muted text-right">Price</TableHead>
                  <TableHead className="theme-text-muted text-right">Change</TableHead>
                  <TableHead className="theme-text-muted text-right">P/E</TableHead>
                  <TableHead className="theme-text-muted text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((stock, index) => (
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
                      <span className="text-sm theme-text">{stock.companyName}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium theme-text">
                        ${stock.price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {stock.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 theme-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 theme-danger" />
                        )}
                        <span className={`font-mono font-medium ${stock.changePercent >= 0 ? 'theme-success' : 'theme-danger'}`}>
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
                        {(stock.volume / 1000000).toFixed(1)}M
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {screenMutation.isError && (
        <div className="p-4 rounded-lg theme-danger bg-opacity-10 theme-border border">
          <p className="text-sm theme-danger">
            Failed to run stock screener. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
