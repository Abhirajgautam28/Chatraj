import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const shouldTrack = () => {
  // Only initialize tracking in production builds and when a GA id is present
  return !!GA_MEASUREMENT_ID && !import.meta.env.DEV && !isLocalHost;
};

export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics ID not found");
    return;
  }
  if (!shouldTrack()) {
    console.info('Skipping Google Analytics in dev/local environment');
    return;
  }
  ReactGA.initialize(GA_MEASUREMENT_ID);
  console.log("Google Analytics Initialized");
};

export const trackPageView = (path) => {
  if (!shouldTrack()) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category, action, label) => {
  if (!shouldTrack()) return;
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};
