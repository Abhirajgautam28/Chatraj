import React from 'react';

// ...existing code...
import { createContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const savedTheme = window.localStorage.getItem('isDarkMode');
        return savedTheme ? JSON.parse(savedTheme) : false;
      }
    } catch (e) {
      // ignore and fallback to default
    }
    return false;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      // ignore errors in non-browser environments (tests)
    }
  }, [isDarkMode]);

  const toggleThemeGlobal = (shouldReduceMotion = false) => {
    if (shouldReduceMotion || typeof document === 'undefined') {
      setIsDarkMode(prev => !prev);
      return;
    }

    if (!document.startViewTransition) {
      const durationStr = getComputedStyle(document.documentElement).getPropertyValue('--theme-transition-duration').trim();
      let durationMs = 750;
      if (durationStr.endsWith('ms')) {
        durationMs = parseFloat(durationStr);
      } else if (durationStr.endsWith('s')) {
        durationMs = parseFloat(durationStr) * 1000;
      }

      document.documentElement.classList.add('theme-transitioning');
      setIsDarkMode(prev => !prev);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, durationMs);
      return;
    }

    document.documentElement.classList.add('theme-transition');
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(prev => !prev);
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition');
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleThemeGlobal }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};