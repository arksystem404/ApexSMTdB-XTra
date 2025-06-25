import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'wallstreet' | 'techinvestor' | 'hedgefund';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    
    // Apply new theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme !== 'light') {
      root.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
