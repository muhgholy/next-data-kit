'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
     children: React.ReactNode;
     defaultTheme?: Theme;
     storageKey?: string;
}

interface ThemeContextValue {
     theme: Theme;
     setTheme: (theme: Theme) => void;
     resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
     children,
     defaultTheme = 'system',
     storageKey = 'theme',
}: ThemeProviderProps) {
     const [theme, setTheme] = useState<Theme>(defaultTheme);
     const [mounted, setMounted] = useState(false);

     useEffect(() => {
          setMounted(true);
          const stored = localStorage.getItem(storageKey) as Theme | null;
          if (stored) {
               setTheme(stored);
          }
     }, [storageKey]);

     useEffect(() => {
          if (!mounted) return;

          const root = document.documentElement;
          root.classList.remove('light', 'dark');

          let resolvedTheme: 'light' | 'dark' = 'light';
          if (theme === 'system') {
               resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
          } else {
               resolvedTheme = theme;
          }

          root.classList.add(resolvedTheme);
          localStorage.setItem(storageKey, theme);
     }, [theme, mounted, storageKey]);

     const handleSetTheme = (newTheme: Theme) => {
          setTheme(newTheme);
     };

     const resolvedTheme: 'light' | 'dark' =
          theme === 'system'
               ? typeof window !== 'undefined' &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
               : theme;

     return (
          <ThemeContext.Provider
               value={{ theme, setTheme: handleSetTheme, resolvedTheme }}
          >
               {children}
          </ThemeContext.Provider>
     );
}

export function useTheme() {
     const context = useContext(ThemeContext);
     if (context === undefined) {
          throw new Error('useTheme must be used within a ThemeProvider');
     }
     return context;
}
