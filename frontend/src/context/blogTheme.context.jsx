import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const BlogThemeContext = createContext();

export const BlogThemeProvider = ({ children }) => {
  const [isBlogDarkMode, setIsBlogDarkMode] = useState(false);
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
