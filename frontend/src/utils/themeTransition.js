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
    document.documentElement.style.setProperty('--theme-transition-duration', '0.4s');
  } else {
     // Apply theme-specific Light/Dark mode transition
     durationClass = `theme-transition-${activeTheme}`;
     if(activeTheme === 'default' && isHome) {
        // keep liquid mapping if that was intended for Home, otherwise 'default' goes to 'theme-transition-default' (warp)
        durationClass = 'theme-transition-default';
        document.documentElement.style.setProperty('--theme-transition-duration', '0.4s');
     } else if (activeTheme === 'liquidglass') {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.6s');
     } else if (activeTheme === 'minimalist') {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.2s');
     } else if (activeTheme === 'oneui') {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.4s');
     } else {
        document.documentElement.style.setProperty('--theme-transition-duration', '0.35s');
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
