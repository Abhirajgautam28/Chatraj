import React, { createContext, useState, useEffect } from 'react';
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

  const [uiTheme, setUiTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const savedUiTheme = window.localStorage.getItem('uiTheme');
        return savedUiTheme ? JSON.parse(savedUiTheme) : 'default';
      }
    } catch (e) {
      // ignore and fallback to default
    }
    return 'default';
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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('uiTheme', JSON.stringify(uiTheme));
      }
    } catch (e) {
      // ignore errors in non-browser environments (tests)
    }
  }, [uiTheme]);

  const toggleThemeGlobal = async (shouldReduceMotion = false, isHome = false) => {
    const { executeThemeTransition } = await import('../utils/themeTransition.js');
    executeThemeTransition(() => {
      setIsDarkMode(prev => !prev);
    }, shouldReduceMotion, isHome, false);
  };

  const setUiThemeGlobal = async (themeName, shouldReduceMotion = false) => {
    const { executeThemeTransition } = await import('../utils/themeTransition.js');
    executeThemeTransition(() => {
      setUiTheme(themeName);
    }, shouldReduceMotion, false, true);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleThemeGlobal, uiTheme, setUiThemeGlobal }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
