import { useContext } from 'react';
import { ThemeContext } from './theme.context';

const useTheme = () => useContext(ThemeContext);

export default useTheme;
