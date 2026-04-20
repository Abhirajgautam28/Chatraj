
import { createRoot } from 'react-dom/client';
import Modal from 'react-modal';
import 'animate.css';
import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.jsx';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

Modal.setAppElement('#root');

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <SpeedInsights />
    <Analytics />
  </>
);
