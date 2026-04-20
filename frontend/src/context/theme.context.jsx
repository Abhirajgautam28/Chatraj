import React from 'react';

// ...existing code...
import { createContext, useState, useEffect } from 'react';
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

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};