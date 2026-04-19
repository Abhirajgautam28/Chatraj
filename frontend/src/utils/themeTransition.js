import { flushSync } from 'react-dom';

/**
 * Executes a React state update wrapped in a hardware-accelerated
 * View Transition for the global theme swap animation.
 *
 * @param {Function} updateStateCallback - The state setter to execute (e.g. setIsDarkMode)
 * @param {boolean} shouldReduceMotion - Whether the user prefers reduced motion (bypasses animation)
 */
export const executeThemeTransition = (updateStateCallback, shouldReduceMotion = false) => {
  if (shouldReduceMotion || typeof document === 'undefined') {
    updateStateCallback();
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
    updateStateCallback();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, durationMs);
    return;
  }

  document.documentElement.classList.add('theme-transition');

  const transition = document.startViewTransition(() => {
    flushSync(() => {
      updateStateCallback();
    });
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove('theme-transition');
  });
};
