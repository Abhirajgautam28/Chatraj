import { useContext } from 'react';
import { BlogThemeContext } from './blogTheme.context';

const useBlogTheme = () => useContext(BlogThemeContext);

export default useBlogTheme;
