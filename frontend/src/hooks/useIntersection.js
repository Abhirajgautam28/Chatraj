// hooks/useIntersection.js
import { useEffect, useCallback } from 'react';

export function useIntersection(ref, onIntersect, options) {
  const memoizedCallback = useCallback(onIntersect, [onIntersect]);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const obs = new window.IntersectionObserver(memoizedCallback, options);
    obs.observe(node);
    return () => {
      if (node) obs.unobserve(node);
      obs.disconnect();
    };
  }, [ref, memoizedCallback, options]);
}
