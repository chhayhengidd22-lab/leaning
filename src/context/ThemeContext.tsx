import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light' | 'amber';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isLight: boolean;
  isDark: boolean;
  isAmber: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  isLight: false,
  isDark: true,
  isAmber: false
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('devlearn_theme');
    if (saved === 'light' || saved === 'amber' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('devlearn_theme', newTheme);
  };

  useEffect(() => {
    // Apply data-theme attribute on <html> and <body>
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Apply color-scheme
    if (theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('theme-dark', 'theme-amber');
      document.body.classList.add('theme-light');
    } else if (theme === 'amber') {
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add('theme-amber');
    } else {
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.remove('theme-light', 'theme-amber');
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const isAmber = theme === 'amber';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLight, isDark, isAmber }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
