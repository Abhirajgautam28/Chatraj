import { createContext, useState } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';

const BlogThemeContext = createContext();

export const BlogThemeProvider = ({ children }) => {
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(false);

  const toggleThemeGlobal = (shouldReduceMotion = false) => {
    if (shouldReduceMotion || typeof document === 'undefined') {
      setIsBlogDarkMode((prev) => !prev);
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
      setIsBlogDarkMode((prev) => !prev);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, durationMs);
      return;
    }

    document.documentElement.classList.add('theme-transition');
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsBlogDarkMode((prev) => !prev);
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition');
    });
  };

  return (
    <BlogThemeContext.Provider value={{ isBlogDarkMode, setIsBlogDarkMode, toggleThemeGlobal }}>
      {children}
    </BlogThemeContext.Provider>
  );
};

BlogThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { BlogThemeContext };
