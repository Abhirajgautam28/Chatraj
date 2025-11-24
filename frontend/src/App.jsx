
import React from 'react';
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'
import { ThemeProvider } from './context/theme.context'
import ThreeBackground from './components/ThreeBackground';

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThreeBackground />
        <AppRoutes />
      </UserProvider>
    </ThemeProvider>
  )
}

export default App