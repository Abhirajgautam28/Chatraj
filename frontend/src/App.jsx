
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
        <div className="relative z-10">
          <AppRoutes />
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App