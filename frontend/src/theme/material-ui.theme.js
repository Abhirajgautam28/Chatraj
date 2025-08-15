import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // palette values for light mode
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#9c27b0', // purple
            },
            background: {
              default: '#ffffff',
              paper: '#f5f5f5',
            },
          }
        : {
            // palette values for dark mode
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#ce93d8', // light purple
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
    },
  });

export default getTheme;
