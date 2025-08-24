
import { createRoot } from 'react-dom/client';
import 'animate.css';
import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.jsx';
import { SpeedInsights } from '@vercel/speed-insights/react';

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <SpeedInsights />
  </>
);
