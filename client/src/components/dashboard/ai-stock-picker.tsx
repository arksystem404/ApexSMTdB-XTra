import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const MOCK_USER_ID = 1;

export function AIStockPicker() {
  const [pickedStocks, setPickedStocks] = useState<string>('');

  const stockPickerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/stock-picker', {
        userId: MOCK_USER_ID,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPickedStocks(data.analysis);
    },
  });

  return (
    <Card className="theme-card theme-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold theme-text">AI Stock Picker</h3>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => stockPickerMutation.mutate()}
            disabled={stockPickerMutation.isPending}
            className="w-full theme-accent text-white hover:opacity-90"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {stockPickerMutation.isPending ? 'Analyzing...' : 'Get AI Stock Picks'}
          </Button>

          {pickedStocks && (
            <div className="p-4 rounded-lg theme-surface">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 theme-accent-text" />
                <span className="text-sm font-medium theme-text">AI Recommendations</span>
              </div>
              <div className="text-sm theme-text-muted whitespace-pre-wrap">
                {pickedStocks}
              </div>
            </div>
          )}

          {stockPickerMutation.isError && (
            <div className="p-4 rounded-lg theme-danger bg-opacity-10 theme-border border">
              <p className="text-sm theme-danger">
                Failed to get AI stock picks. Please try again.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}