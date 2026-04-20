import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const ChatRajThemeContext = createContext();

export function ChatRajThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('chatrajTheme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('chatrajTheme', JSON.stringify(isDarkMode));

    document.documentElement.classList.remove('dark', 'light');

    document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ChatRajThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ChatRajThemeContext.Provider>
  );
}

ChatRajThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};