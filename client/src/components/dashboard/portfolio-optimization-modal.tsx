import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { PortfolioOptimization } from '@shared/schema';

interface PortfolioOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  optimizationData?: PortfolioOptimization;
  isLoading: boolean;
}

export function PortfolioOptimizationModal({
  isOpen,
  onClose,
  optimizationData,
  isLoading,
}: PortfolioOptimizationModalProps) {
  // Mock data for demonstration
  const mockOptimization: PortfolioOptimization = {
    currentAllocation: {
      'Technology': 35,
      'Healthcare': 20,
      'Finance': 15,
      'Consumer': 30,
    },
    recommendedAllocation: {
      'Technology': 28,
      'Healthcare': 25,
      'Finance': 12,
      'Consumer': 35,
    },
    expectedReturn: 12.5,
    riskReduction: 8.3,
    reasoning: 'Based on current market conditions and your risk profile, we recommend reducing technology exposure and increasing healthcare and consumer sectors for better diversification and risk-adjusted returns.',
  };

  const data = optimizationData || mockOptimization;

  const handleApplyOptimization = () => {
    // TODO: Implement portfolio rebalancing logic
    console.log('Applying portfolio optimization...');
    onClose();
  };

  const getAllocationChange = (sector: string): number => {
    const current = data.currentAllocation[sector] || 0;
    const recommended = data.recommendedAllocation[sector] || 0;
    return recommended - current;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'theme-success';
    if (change < 0) return 'theme-danger';
    return 'theme-text-muted';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl theme-card theme-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold theme-text">
              Portfolio Optimization Tool
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="theme-text-muted hover:theme-surface"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4 theme-accent-text"></div>
            <p className="theme-text-muted">Analyzing your portfolio...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg theme-surface">
              <div>
                <div className="text-sm theme-text-muted mb-1">Expected Return Improvement</div>
                <div className="text-2xl font-bold theme-success">+{data.expectedReturn}%</div>
              </div>
              <div>
                <div className="text-sm theme-text-muted mb-1">Risk Reduction</div>
                <div className="text-2xl font-bold theme-success">-{data.riskReduction}%</div>
              </div>
            </div>

            {/* Allocation Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Allocation */}
              <div>
                <h3 className="text-lg font-medium theme-text mb-4">Current Allocation</h3>
                <div className="space-y-3">
                  {Object.entries(data.currentAllocation).map(([sector, percentage]) => (
                    <div key={sector} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="theme-text">{sector}</span>
                        <span className="font-mono theme-text">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Allocation */}
              <div>
                <h3 className="text-lg font-medium theme-text mb-4">AI Recommended</h3>
                <div className="space-y-3">
                  {Object.entries(data.recommendedAllocation).map(([sector, percentage]) => {
                    const change = getAllocationChange(sector);
                    return (
                      <div key={sector} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="theme-text">{sector}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono theme-text">{percentage}%</span>
                            {change !== 0 && (
                              <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
                                {getChangeIcon(change)}
                                <span className="text-sm font-medium">
                                  {Math.abs(change).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-4 rounded-lg theme-surface">
              <h4 className="font-medium theme-text mb-2">AI Analysis & Reasoning</h4>
              <p className="text-sm theme-text-muted leading-relaxed">{data.reasoning}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 theme-border border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="theme-surface theme-border theme-text"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyOptimization}
                className="theme-accent text-white hover:opacity-90"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Apply Optimization
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
