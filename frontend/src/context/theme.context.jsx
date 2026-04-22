import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Global theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('isDarkMode');
      return savedTheme ? JSON.parse(savedTheme) : false;
    } catch (e) {
      return false;
    }
  });

  // ChatRaj specific theme
  const [isChatRajDarkMode, setIsChatRajDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('chatrajTheme');
      return savedTheme ? JSON.parse(savedTheme) : false;
    } catch (e) {
      return false;
    }
  });

  // Blog specific theme
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('blog_dark_mode');
      return savedTheme ? JSON.parse(savedTheme) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    // Root dark mode handles most screens
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('chatrajTheme', JSON.stringify(isChatRajDarkMode));
  }, [isChatRajDarkMode]);

  useEffect(() => {
    localStorage.setItem('blog_dark_mode', JSON.stringify(isBlogDarkMode));
  }, [isBlogDarkMode]);

  return (
    <ThemeContext.Provider value={{
      isDarkMode, setIsDarkMode,
      isChatRajDarkMode, setIsChatRajDarkMode,
      isBlogDarkMode, setIsBlogDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
