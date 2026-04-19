import { createContext, useState } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';

const BlogThemeContext = createContext();

export const BlogThemeProvider = ({ children }) => {
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(false);

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
