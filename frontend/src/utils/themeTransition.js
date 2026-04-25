export const executeThemeTransition = (toggleFn, shouldReduceMotion = false, isHome = false) => {
  if (
    !document.startViewTransition ||
    shouldReduceMotion ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    toggleFn();
    return;
  }

  const durationClass = isHome ? 'theme-transition-circle' : 'theme-transition';

  if (isHome) {
     document.documentElement.style.setProperty('--theme-transition-duration', '1.5s');
  } else {
     document.documentElement.style.setProperty('--theme-transition-duration', '0.75s');
  }

  document.documentElement.classList.add(durationClass);

  const transition = document.startViewTransition(async () => {
    toggleFn();
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove(durationClass);
  });
};
