import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const MOCK_USER_ID = 1;

export function MarketQA() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const qaMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/ai/market-question', {
        userId: MOCK_USER_ID,
        question,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnswer(data.answer);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      qaMutation.mutate(question.trim());
    }
  };

  return (
    <Card className="theme-card theme-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold theme-text">Market Q&A</h3>
        </div>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              placeholder="Ask about market conditions, trends, or specific stocks..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="theme-surface theme-border theme-text flex-1"
            />
            <Button 
              type="submit"
              disabled={qaMutation.isPending || !question.trim()}
              className="theme-accent text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {answer && (
            <div className="p-4 rounded-lg theme-surface">
              <div className="text-sm theme-text-muted mb-2">AI Answer:</div>
              <div className="text-sm theme-text whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}

          {qaMutation.isError && (
            <div className="p-4 rounded-lg theme-danger bg-opacity-10 theme-border border">
              <p className="text-sm theme-danger">
                Failed to get answer. Please try again.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}