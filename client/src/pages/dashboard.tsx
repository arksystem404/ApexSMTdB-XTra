import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { Watchlist } from '@/components/dashboard/watchlist';
import { AIInvestmentFund } from '@/components/dashboard/ai-investment-fund';
import { StockScreener } from '@/components/dashboard/stock-screener';
import { MarketTicker } from '@/components/dashboard/market-ticker';
import { AIStockPicker } from '@/components/dashboard/ai-stock-picker';
import { MarketQA } from '@/components/dashboard/market-qa';
import { UserProfile } from '@/components/dashboard/user-profile';
import { 
  Bell, 
  Settings, 
  DollarSign, 
  Heart, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Target,
  Brain,
  Search
} from 'lucide-react';
import type { WatchlistItem } from '@shared/schema';

const MOCK_USER_ID = 1; // For demo purposes

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('market');

  const { data: watchlistItems = [] } = useQuery<WatchlistItem[]>({
    queryKey: [`/api/watchlist/${MOCK_USER_ID}`],
  });

  const portfolioStats = {
    value: 127845.30,
    change: 12.5,
    activePositions: 8,
    priceAlerts: 6,
  };

  const marketSignals = [
    { sector: 'Technology', signal: 'BUY', color: 'theme-success' },
    { sector: 'Energy', signal: 'HOLD', color: 'theme-warning' },
    { sector: 'Real Estate', signal: 'SELL', color: 'theme-danger' },
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case 'market':
        return (
          <div className="max-w-6xl">
            <MarketOverview />
          </div>
        );
      case 'watchlist':
        return (
          <div className="max-w-6xl">
            <Watchlist />
          </div>
        );
      case 'ai-fund':
        return (
          <div className="max-w-6xl space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInvestmentFund />
              <AIStockPicker />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketQA />
              
              {/* Market Signals */}
              <Card className="theme-card theme-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold theme-text">Market Signals</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {marketSignals.map((signal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg theme-surface">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${signal.color}`}></div>
                          <span className="text-sm font-medium theme-text">{signal.sector}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${signal.color} text-white text-xs`}
                        >
                          {signal.signal}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'screener':
        return (
          <div className="max-w-6xl">
            <StockScreener />
          </div>
        );
      case 'journal':
        return (
          <div className="max-w-4xl">
            <Card className="theme-card theme-border">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 theme-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold theme-text mb-2">Trading Journal Disabled</h3>
                <p className="theme-text-muted mb-4">
                  The trading journal feature is currently disabled. Contact support to enable this feature.
                </p>
                <Badge variant="outline" className="theme-warning">
                  Feature Disabled
                </Badge>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="theme-card theme-border backdrop-blur-custom">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold theme-text mb-2">
                      Professional Trading Dashboard
                    </h3>
                    <p className="text-sm leading-relaxed max-w-2xl theme-text-muted">
                      Advanced watchlist management with real-time market data, AI-powered portfolio optimization, 
                      and professional stock screening tools. Your primary focus: comprehensive watchlist tracking 
                      with intelligent market analysis.
                    </p>
                  </div>
                  <Badge className="theme-accent text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Live Data
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="theme-card theme-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-green-500 text-white">+{portfolioStats.change}%</Badge>
                  </div>
                  <h4 className="text-sm font-medium theme-text-muted mb-1">Portfolio Value</h4>
                  <p className="text-2xl font-bold font-mono theme-text">
                    ${portfolioStats.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="theme-card theme-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg theme-accent flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="theme-text-muted">
                      {watchlistItems.filter(item => item.isActive).length} Active
                    </Badge>
                  </div>
                  <h4 className="text-sm font-medium theme-text-muted mb-1">Watchlist Items</h4>
                  <p className="text-2xl font-bold font-mono theme-text">{watchlistItems.length}</p>
                </CardContent>
              </Card>

              <Card className="theme-card theme-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-orange-500 text-white">Hot</Badge>
                  </div>
                  <h4 className="text-sm font-medium theme-text-muted mb-1">Active Positions</h4>
                  <p className="text-2xl font-bold font-mono theme-text">{portfolioStats.activePositions}</p>
                </CardContent>
              </Card>

              <Card className="theme-card theme-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="secondary">2 New</Badge>
                  </div>
                  <h4 className="text-sm font-medium theme-text-muted mb-1">Price Alerts</h4>
                  <p className="text-2xl font-bold font-mono theme-text">{portfolioStats.priceAlerts}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Watchlist - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <Watchlist />
              </div>

              {/* Right Sidebar - AI Insights */}
              <div className="space-y-6">
                <AIInvestmentFund />
                
                <AIStockPicker />
                
                {/* Quick Screener Preview */}
                <Card className="theme-card theme-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-lg theme-accent flex items-center justify-center">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold theme-text">Quick Screen</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm theme-text-muted">
                        Run advanced stock screening with custom filters
                      </div>
                      <Button 
                        onClick={() => setActiveSection('screener')}
                        className="w-full theme-accent text-white hover:opacity-90"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Open Stock Screener
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden theme-transition">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        watchlistCount={watchlistItems.length}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between theme-surface theme-border border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold theme-text">
              {activeSection === 'dashboard' ? 'Market Dashboard' : 
               activeSection === 'watchlist' ? 'Watchlist' :
               activeSection === 'ai-fund' ? 'AI Investment Fund' :
               activeSection === 'screener' ? 'Stock Screener' :
               activeSection === 'journal' ? 'Trading Journal' : 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-2 text-sm theme-text-muted">
              <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></div>
              <span>Market Open</span>
            </div>
          </div>
          
          <MarketTicker />

          <div className="flex items-center space-x-3">
            <UserProfile />
            <Button variant="outline" size="sm" className="theme-card theme-border theme-text">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}
