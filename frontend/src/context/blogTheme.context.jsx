import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const BlogThemeContext = createContext();

export const BlogThemeProvider = ({ children }) => {
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(false);

  const toggleThemeGlobal = async (shouldReduceMotion = false, isHome = false) => {
    const { executeThemeTransition } = await import('../utils/themeTransition.js');
    executeThemeTransition(() => {
      setIsBlogDarkMode((prev) => !prev);
    }, shouldReduceMotion, isHome);
  };

  return (
    <BlogThemeContext.Provider value={{ isBlogDarkMode, setIsBlogDarkMode }}>
      {children}
    </BlogThemeContext.Provider>
  );
};

BlogThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { BlogThemeContext };
