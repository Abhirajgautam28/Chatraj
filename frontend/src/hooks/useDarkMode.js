import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

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

  const toggleThemeGlobal = (shouldReduceMotion = false) => {
    if (shouldReduceMotion || typeof document === 'undefined') {
      setDarkMode((prev) => !prev);
      return;
    }

    if (!document.startViewTransition) {
      const durationStr = getComputedStyle(document.documentElement).getPropertyValue('--theme-transition-duration').trim();
      let durationMs = 750;
      if (durationStr.endsWith('ms')) {
        durationMs = parseFloat(durationStr);
      } else if (durationStr.endsWith('s')) {
        durationMs = parseFloat(durationStr) * 1000;
      }

      document.documentElement.classList.add('theme-transitioning');
      setDarkMode((prev) => !prev);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, durationMs);
      return;
    }

    document.documentElement.classList.add('theme-transition');
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setDarkMode((prev) => !prev);
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition');
    });
  };

  return [darkMode, setDarkMode, toggleThemeGlobal];
};

export default useDarkMode;
