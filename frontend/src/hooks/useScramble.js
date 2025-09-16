// hooks/useScramble.js
import { useState, useEffect } from 'react';
import { getNextIndex, shuffleText } from '../utils/scramble';

export function useScramble({
  text, isHovering, speed, maxIterations,
  sequential, revealDirection, useOriginalCharsOnly, characters
}) {
  const [displayText, setDisplayText]     = useState(text);
  const [revealedSet, setRevealedSet]     = useState(new Set());
  const [isScrambling, setIsScrambling]   = useState(false);

  useEffect(() => {
    let iv;
    let iter = 0;
    let mounted = true;
    if (!isHovering) {
      if (mounted) {
        setDisplayText(text);
        setRevealedSet(new Set());
        setIsScrambling(false);
      }
      return;
    }
    setIsScrambling(true);
    iv = setInterval(() => {
      setRevealedSet(prev => {
        let next = new Set(prev);
        if (sequential && next.size < text.length) {
          next.add(getNextIndex(text.length, prev, revealDirection));
        }
        const newText = shuffleText(text, next, { useOriginalCharsOnly, characters });
        if (mounted) {
          setDisplayText(sequential ? newText : (iter++ < maxIterations ? newText : text));
        }
        if ((!sequential && iter >= maxIterations) || (sequential && next.size >= text.length)) {
          clearInterval(iv);
          if (mounted) setIsScrambling(false);
        }
        return next;
      });
    }, speed);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [
    isHovering, text, speed, maxIterations,
    sequential, revealDirection, useOriginalCharsOnly, characters
  ]);

  return { displayText, revealedSet, isScrambling };
}
