import { useState, useEffect } from 'react';

const useDarkMode = (key = 'blog_dark_mode', defaultValue = false) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) return stored === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(key, darkMode);

      // Subscribe to system theme changes
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
  }, [darkMode, key]);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
