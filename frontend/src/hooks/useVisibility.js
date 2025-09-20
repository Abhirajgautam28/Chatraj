import { useEffect, useState } from 'react';

export function useVisibility(ref, { threshold = 0.1 } = {}) {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new window.IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);

  return isVisible;
}
