import { useState, useEffect } from 'react';

const useDarkMode = (key = 'blog_dark_mode', defaultValue = false) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return defaultValue;
  });

  // Effect for applying dark mode and storing preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(key, JSON.stringify(darkMode));
    }
  }, [darkMode, key]);

  // Effect for subscribing to system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        // Only update if user hasn't set a preference
        if (localStorage.getItem(key) === null) {
          setDarkMode(e.matches);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [key]);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
