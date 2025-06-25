import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { PortfolioOptimizationModal } from './portfolio-optimization-modal';
import type { PortfolioOptimization } from '@shared/schema';

const MOCK_USER_ID = 1; // For demo purposes

export function AIInvestmentFund() {
  const [showOptimization, setShowOptimization] = useState(false);

  const { data: portfolioData } = useQuery({
    queryKey: [`/api/portfolio/${MOCK_USER_ID}`],
  });

  const optimizationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/portfolio-optimization', {
        userId: MOCK_USER_ID,
        riskTolerance: 'moderate',
      });
      return response.json();
    },
  });

  const handleOptimizePortfolio = () => {
    setShowOptimization(true);
    if (!optimizationMutation.data) {
      optimizationMutation.mutate();
    }
  };

  // Mock performance data
  const performanceData = {
    currentReturn: 18.7,
    targetReturn: 22.0,
    riskScore: 75,
    diversificationScore: 8.5,
  };

  return (
    <>
      <div className="theme-card theme-border border rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg theme-accent flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold theme-text">AI Investment Fund</h3>
        </div>
        
        <div className="space-y-4">
          {/* Performance Overview */}
          <div className="p-4 rounded-lg theme-surface">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium theme-text-muted">Current Performance</span>
              <span className="text-sm font-bold theme-success">+{performanceData.currentReturn}%</span>
            </div>
            <Progress 
              value={performanceData.riskScore} 
              className="w-full h-2"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 theme-success" />
                <span className="text-xs theme-text-muted">Target Return</span>
              </div>
              <div className="text-lg font-bold theme-text">{performanceData.targetReturn}%</div>
            </div>
            
            <div className="p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 theme-accent-text" />
                <span className="text-xs theme-text-muted">Diversification</span>
              </div>
              <div className="text-lg font-bold theme-text">{performanceData.diversificationScore}/10</div>
            </div>
          </div>

          {/* Portfolio Optimization Button */}
          <Button 
            onClick={handleOptimizePortfolio}
            className="w-full theme-accent text-white hover:opacity-90 transition-opacity"
            disabled={optimizationMutation.isPending}
          >
            <Target className="w-4 h-4 mr-2" />
            {optimizationMutation.isPending ? 'Optimizing...' : 'Portfolio Optimization'}
          </Button>

          {/* Description */}
          <div className="text-sm theme-text-muted">
            <p>
              AI-powered diversification across 12 sectors with risk-adjusted returns 
              optimized for your profile. Our machine learning algorithms continuously 
              analyze market conditions to maximize returns while minimizing risk.
            </p>
          </div>
        </div>
      </div>

      <PortfolioOptimizationModal
        isOpen={showOptimization}
        onClose={() => setShowOptimization(false)}
        optimizationData={optimizationMutation.data}
        isLoading={optimizationMutation.isPending}
      />
    </>
  );
}
