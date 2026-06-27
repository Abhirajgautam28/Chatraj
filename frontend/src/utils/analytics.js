import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("Google Analytics Initialized");
  } else {
    console.warn("Google Analytics ID not found");
  }
};

export const trackPageView = (path) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

export const trackEvent = (category, action, label) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category: category,
      action: action,
      label: label,
    });
  }
};
