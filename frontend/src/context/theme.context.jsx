import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  // Global Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isDarkMode');
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // Blog Specific Theme
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isBlogDarkMode');
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // ChatRaj Specific Theme
  const [isChatDarkMode, setIsChatDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('chatrajTheme');
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    // Root class follows global theme unless overridden by specific pages (handled in those pages)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isBlogDarkMode', JSON.stringify(isBlogDarkMode));
  }, [isBlogDarkMode]);

  useEffect(() => {
    localStorage.setItem('chatrajTheme', JSON.stringify(isChatDarkMode));
  }, [isChatDarkMode]);

  const value = {
    isDarkMode, setIsDarkMode,
    isBlogDarkMode, setIsBlogDarkMode,
    isChatDarkMode, setIsChatDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
