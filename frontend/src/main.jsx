import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import 'animate.css';
import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.jsx';

const AppWrapper = () => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate}>
      <App />
    </HeroUIProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <Router>
    <AppWrapper />
  </Router>
);
