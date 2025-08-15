import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import 'animate.css';
import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.jsx';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/material-ui.theme';
import { ThemeContext, ThemeProvider } from './context/theme.context';

const Root = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <Root />
  </ThemeProvider>
);
