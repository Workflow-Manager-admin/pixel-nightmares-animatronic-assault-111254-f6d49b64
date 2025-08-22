import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentSetting } from '../hooks/usePersistentSetting';

// PUBLIC_INTERFACE
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

/**
 * PUBLIC_INTERFACE
 * ThemeProvider wraps app and provides theme + toggle via context.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = usePersistentSetting('theme', 'dark');
  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Returns theme context: { theme, toggleTheme } */
  return useContext(ThemeContext);
}
