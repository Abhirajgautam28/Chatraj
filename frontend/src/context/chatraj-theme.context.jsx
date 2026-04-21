import { createContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
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

  const toggleThemeGlobal = async (shouldReduceMotion = false, isHome = false) => {
    const { executeThemeTransition } = await import('../utils/themeTransition.js');
    executeThemeTransition(() => {
      setIsDarkMode((prev) => !prev);
    }, shouldReduceMotion, isHome);
  };

  return (
    <ChatRajThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleThemeGlobal }}>
      {children}
    </ChatRajThemeContext.Provider>
  );
}

ChatRajThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};