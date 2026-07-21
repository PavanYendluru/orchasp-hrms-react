import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getSystem() {
  return window.matchMedia('(prefers-color-scheme)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('orchasp-theme') || 'system');
  const [resolved, setResolved] = useState(() => localStorage.getItem('orchasp-theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    const r = theme === 'system' ? getSystem() : theme;
    setResolved(r);
    document.documentElement.classList.toggle('dark', r === 'dark');
    localStorage.setItem('orchasp-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme)');
    const handler = () => {
      const r = getSystem();
      setResolved(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolved,
        setTheme: setThemeState,
        toggle: () => setThemeState(resolved === 'dark' ? 'light' : 'dark'),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
