export const executeThemeTransition = (toggleFn, shouldReduceMotion = false, isHome = false, isDestruct = false, activeTheme = 'default') => {
  if (
    !document.startViewTransition ||
    shouldReduceMotion ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    toggleFn();
    return;
  }

  let durationClass = 'theme-transition';

  if (isDestruct) {
    durationClass = 'theme-transition-destruct';
    document.documentElement.style.setProperty('--theme-transition-duration', '0.5s');
  } else {
     // Apply theme-specific Light/Dark mode transition
     durationClass = `theme-transition-${activeTheme}`;
     if(activeTheme === 'default' && isHome) {
        durationClass = 'theme-transition-liquid';
        document.documentElement.style.setProperty('--theme-transition-duration', '1.5s');
     } else if (activeTheme === 'liquidglass') {
        document.documentElement.style.setProperty('--theme-transition-duration', '1.5s');
     } else if (activeTheme === 'minimalist') {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.2s');
     } else {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.75s');
     }
  }

  document.documentElement.classList.add(durationClass);

  const transition = document.startViewTransition(async () => {
    toggleFn();
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove(durationClass);
  });
};
