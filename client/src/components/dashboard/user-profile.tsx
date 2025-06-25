import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Settings, DollarSign } from 'lucide-react';

export function UserProfile() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [accountId, setAccountId] = useState(localStorage.getItem('smtAccountId') || '9158');
  const [sessionId, setSessionId] = useState(localStorage.getItem('smtSessionId') || '782546733');

  const { data: userProfile } = useQuery({
    queryKey: [`/api/market/data`],
    select: (data) => ({
      cash: data?.playerCash || 0,
      portfolioValue: data?.playerPortfolioValue || 0,
      username: data?.playerName || 'Trader'
    }),
  });

  const updateCredentials = async () => {
    try {
      const response = await fetch('/api/smt/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, sessionId }),
      });
      
      if (response.ok) {
        localStorage.setItem('smtAccountId', accountId);
        localStorage.setItem('smtSessionId', sessionId);
        setIsConfigOpen(false);
        window.location.reload(); // Refresh to use new credentials
      }
    } catch (error) {
      console.error('Failed to update credentials:', error);
    }
  };

  return (
    <Card className="theme-card theme-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg theme-accent flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium theme-text">{userProfile?.username}</div>
              <div className="text-sm theme-text-muted">
                Cash: ${(userProfile?.cash / 100 || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="theme-text-muted">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="theme-card theme-border">
              <DialogHeader>
                <DialogTitle className="theme-text">SMT Account Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium theme-text">Account ID</label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="theme-surface theme-border theme-text"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium theme-text">Session ID</label>
                  <Input
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="theme-surface theme-border theme-text"
                  />
                </div>
                <Button 
                  onClick={updateCredentials}
                  className="w-full theme-accent text-white"
                >
                  Update Credentials
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}