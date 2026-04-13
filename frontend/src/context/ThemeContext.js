/* =============================================================================
 * Theme Context (Light/Dark)
 * =============================================================================
 * Purpose:
 *   Provide a global theme toggle that adds `light`/`dark` classes to the
 *   document element.
 *
 Key Behavior:
 *   - Persists chosen theme in `localStorage`
 *   - Exposes `useTheme()` and `ThemeProvider`
 * ============================================================================= */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};