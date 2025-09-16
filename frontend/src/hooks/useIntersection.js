// hooks/useIntersection.js
import { useEffect } from 'react';

export function useIntersection(ref, onIntersect, options) {
  useEffect(() => {
    if (!ref.current) return;
    const obs = new window.IntersectionObserver(onIntersect, options);
    obs.observe(ref.current);
    return () => {
      if (ref.current) obs.unobserve(ref.current);
      obs.disconnect();
    };
  }, [ref, onIntersect, JSON.stringify(options)]);
}
