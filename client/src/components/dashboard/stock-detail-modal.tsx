import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Info, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

interface StockDetail {
  sharedetail: {
    sID: number;
    sName: string;
    sCompanyName: string;
    lp: number; // Last price (in cents)
    lm: number; // Last movement (in cents)
    hv: number; // High value
    lv: number; // Low value
    ov: number; // Open value
    tv: number; // Total volume
    eps: number; // Earnings per share
    bv: number; // Book value
    ts: number; // Total shares outstanding
    ld: number; // Last dividend
    iID: string; // Industry ID
  };
  ordersummary?: {
    bq: number; // Buyer quantity
    ba: number; // Buyer amount
    sq: number; // Seller quantity
    sa: number; // Seller amount
  };
  orderdepth?: {
    buyers: Array<{ price: number; quantity: number }>;
    sellers: Array<{ price: number; quantity: number }>;
  };
  pricehistory?: Array<{
    date: string;
    price: number;
    volume: number;
    signal?: 'B' | 'S'; // Buy/Sell signals
  }>;
}

// Custom dot component for buy/sell signals
const SignalDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.signal) return null;
  
  const isBuy = payload.signal === 'B';
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={8} 
        fill={isBuy ? '#22c55e' : '#ef4444'} 
        stroke="#fff" 
        strokeWidth={2}
      />
      <text 
        x={cx} 
        y={cy} 
        dy={4} 
        textAnchor="middle" 
        fill="#fff" 
        fontSize={10} 
        fontWeight="bold"
      >
        {payload.signal}
      </text>
    </g>
  );
};

export function StockDetailModal({ isOpen, onClose, symbol }: StockDetailModalProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);

  // Fetch stock detail data
  const { data: stockDetail, isLoading } = useQuery({
    queryKey: ['/api/stocks/detail', symbol],
    enabled: isOpen && !!symbol,
    refetchInterval: 30000,
  });

  // Generate AI analysis for the stock
  const generateAiAnalysis = async () => {
    if (!stockDetail?.sharedetail) return;
    
    setLoadingAiAnalysis(true);
    try {
      const response = await apiRequest('POST', '/api/ai/stock-analysis', {
        symbol,
        stockData: stockDetail.sharedetail,
        orderSummary: stockDetail.ordersummary,
        priceHistory: stockDetail.pricehistory,
      });
      const result = await response.json();
      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  const formatCurrency = (value: number) => {
    return (value / 100).toFixed(2);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const calculateMetrics = (detail: StockDetail['sharedetail']) => {
    const price = detail.lp / 100;
    const eps = detail.eps / 100;
    const bookValue = detail.bv / 100;
    const dividend = detail.ld / 100;
    
    const peRatio = eps > 0 ? price / eps : null;
    const pbRatio = bookValue > 0 ? price / bookValue : null;
    const marketCap = price * detail.ts;
    const dividendYield = dividend > 0 ? (dividend / price) * 100 : null;
    
    return { peRatio, pbRatio, marketCap, dividendYield };
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto theme-card theme-border" aria-describedby="stock-detail-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between theme-text">
            <span>Stock Details: {symbol}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="stock-detail-description" className="sr-only">
          Detailed view of stock information including price charts, financial metrics, and AI analysis for {symbol}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : stockDetail?.sharedetail ? (
          <div className="space-y-6">
            {/* Stock Overview */}
            <Card className="theme-card theme-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between theme-text">
                  <div>
                    <h3 className="text-2xl font-bold">{stockDetail.sharedetail.sCompanyName}</h3>
                    <p className="theme-text-muted">{stockDetail.sharedetail.sName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold theme-text">
                      ${formatCurrency(stockDetail.sharedetail.lp)}
                    </div>
                    <div className={`flex items-center ${stockDetail.sharedetail.lm >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stockDetail.sharedetail.lm >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      ${formatCurrency(Math.abs(stockDetail.sharedetail.lm))} ({((stockDetail.sharedetail.lm / stockDetail.sharedetail.lp) * 100).toFixed(2)}%)
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="theme-surface p-3 rounded-md">
                    <div className="text-sm theme-text-muted">Open</div>
                    <div className="text-lg font-semibold theme-text">${formatCurrency(stockDetail.sharedetail.ov)}</div>
                  </div>
                  <div className="theme-surface p-3 rounded-md">
                    <div className="text-sm theme-text-muted">High</div>
                    <div className="text-lg font-semibold theme-text">${formatCurrency(stockDetail.sharedetail.hv)}</div>
                  </div>
                  <div className="theme-surface p-3 rounded-md">
                    <div className="text-sm theme-text-muted">Low</div>
                    <div className="text-lg font-semibold theme-text">${formatCurrency(stockDetail.sharedetail.lv)}</div>
                  </div>
                  <div className="theme-surface p-3 rounded-md">
                    <div className="text-sm theme-text-muted">Volume</div>
                    <div className="text-lg font-semibold theme-text">{formatLargeNumber(stockDetail.sharedetail.tv)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card className="theme-card theme-border">
              <CardHeader>
                <CardTitle className="theme-text">Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const metrics = calculateMetrics(stockDetail.sharedetail);
                    return (
                      <>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">P/E Ratio</div>
                          <div className="text-lg font-semibold theme-text">
                            {metrics.peRatio ? metrics.peRatio.toFixed(2) : 'N/A'}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">P/B Ratio</div>
                          <div className="text-lg font-semibold theme-text">
                            {metrics.pbRatio ? metrics.pbRatio.toFixed(2) : 'N/A'}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">Market Cap</div>
                          <div className="text-lg font-semibold theme-text">
                            ${formatLargeNumber(metrics.marketCap)}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">Dividend Yield</div>
                          <div className="text-lg font-semibold theme-text">
                            {metrics.dividendYield ? `${metrics.dividendYield.toFixed(2)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">EPS</div>
                          <div className="text-lg font-semibold theme-text">
                            ${formatCurrency(stockDetail.sharedetail.eps)}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">Book Value</div>
                          <div className="text-lg font-semibold theme-text">
                            ${formatCurrency(stockDetail.sharedetail.bv)}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">Shares Outstanding</div>
                          <div className="text-lg font-semibold theme-text">
                            {formatLargeNumber(stockDetail.sharedetail.ts)}
                          </div>
                        </div>
                        <div className="theme-surface p-3 rounded-md">
                          <div className="text-sm theme-text-muted">Last Dividend</div>
                          <div className="text-lg font-semibold theme-text">
                            ${formatCurrency(stockDetail.sharedetail.ld)}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Price Chart with Indicators */}
            {stockDetail.pricehistory && stockDetail.pricehistory.length > 0 && (
              <Card className="theme-card theme-border">
                <CardHeader>
                  <CardTitle className="flex items-center theme-text">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Price Chart with Buy/Sell Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockDetail.pricehistory}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={<SignalDot />}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center mt-4 space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm theme-text-muted">Buy Signal</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm theme-text-muted">Sell Signal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Depth */}
            {stockDetail.ordersummary && (
              <Card className="theme-card theme-border">
                <CardHeader>
                  <CardTitle className="theme-text">Order Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Buyers (Bid)</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm theme-text-muted">Total Quantity:</span>
                          <span className="font-medium theme-text">{stockDetail.ordersummary.bq?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm theme-text-muted">Total Amount:</span>
                          <span className="font-medium theme-text">${formatCurrency(stockDetail.ordersummary.ba)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Sellers (Ask)</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm theme-text-muted">Total Quantity:</span>
                          <span className="font-medium theme-text">{stockDetail.ordersummary.sq?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm theme-text-muted">Total Amount:</span>
                          <span className="font-medium theme-text">${formatCurrency(stockDetail.ordersummary.sa)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Section */}
            <Card className="theme-card theme-border">
              <CardHeader>
                <CardTitle className="flex items-center theme-text">
                  <Activity className="w-5 h-5 mr-2" />
                  AI Deep Dive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <Button 
                    onClick={generateAiAnalysis}
                    disabled={loadingAiAnalysis}
                    className="theme-button-primary"
                  >
                    {loadingAiAnalysis ? 'Analyzing...' : 'Generate AI Analysis'}
                  </Button>
                </div>
                {aiAnalysis && (
                  <div className="theme-surface p-4 rounded-md">
                    <pre className="whitespace-pre-wrap theme-text text-sm">{aiAnalysis}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="theme-text-muted">No stock details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}