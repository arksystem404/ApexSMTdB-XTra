import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThemeContext, type Theme } from './theme-provider';
import { 
  TrendingUp, 
  LayoutDashboard, 
  Heart, 
  Brain, 
  Search, 
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  watchlistCount: number;
}

export function Sidebar({ activeSection, setActiveSection, watchlistCount }: SidebarProps) {
  const { theme, setTheme } = useThemeContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'watchlist', label: 'Watchlist', icon: Heart, badge: watchlistCount },
    { id: 'ai-fund', label: 'AI Investment Fund', icon: Brain },
    { id: 'screener', label: 'Stock Screener', icon: Search },
    { id: 'journal', label: 'Trading Journal', icon: BookOpen, disabled: true },
  ];

  const themes: { id: Theme; label: string; colors: string }[] = [
    { id: 'light', label: 'Light', colors: 'bg-gradient-to-r from-blue-400 to-blue-600' },
    { id: 'dark', label: 'Dark', colors: 'bg-gradient-to-r from-slate-600 to-slate-800' },
    { id: 'wallstreet', label: 'Wall Street', colors: 'bg-gradient-to-r from-black via-yellow-900 to-yellow-500' },
    { id: 'techinvestor', label: 'Tech Investor', colors: 'bg-gradient-to-r from-blue-800 via-purple-700 to-cyan-400' },
    { id: 'hedgefund', label: 'Hedge Fund', colors: 'bg-gradient-to-r from-black via-emerald-900 to-emerald-500' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 theme-surface theme-border border-r theme-transition">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-lg theme-accent flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">APEX SMT</h1>
            <p className="text-xs theme-text-muted">Professional Trading</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`
                  w-full justify-start space-x-3 h-12 px-4 theme-transition
                  ${isActive ? 'theme-accent text-white' : 'theme-text-muted hover:theme-surface'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !item.disabled && setActiveSection(item.id)}
                disabled={item.disabled}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto theme-accent text-white">
                    {item.badge}
                  </Badge>
                )}
                {item.disabled && (
                  <span className="ml-auto text-xs theme-text-muted opacity-60">
                    Off
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Theme Selector */}
        <div className="mt-8 pt-6 theme-border border-t">
          <h3 className="text-sm font-medium mb-3 theme-text-muted">Theme</h3>
          <div className="space-y-2">
            {themes.map((themeOption) => (
              <Button
                key={themeOption.id}
                variant="ghost"
                className={`
                  w-full justify-start space-x-3 h-10 px-3 text-sm theme-transition
                  ${theme === themeOption.id ? 'theme-accent text-white' : 'theme-text-muted hover:theme-surface'}
                `}
                onClick={() => setTheme(themeOption.id)}
              >
                <div className={`w-4 h-4 rounded-full ${themeOption.colors}`} />
                <span>{themeOption.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
