
import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
import { ThemeProvider } from './context/theme.context'
import ThreeBackground from './components/ThreeBackground';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import axios from './config/axios';

const App = () => {
  useEffect(() => {
    // Warm-up call to ensure CSRF cookie is set for the SPA (axios is configured withCredentials)
    axios.get('/csrf-token').catch(() => {
      // ignore errors; token endpoint is best-effort because some environments
      // may set the cookie on other GET responses as well
    });
  }, []);
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <ThreeBackground />
          <div className="relative z-10">
            <AppRoutes />
          </div>
        </UserProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
}

export default App