import { useState, useEffect, useRef } from 'react';
export function useTypingEffect(
  textArray,
  {
    typingSpeed = 75,
    initialDelay = 0,
    pauseDuration = 1500,
    deletingSpeed = 30,
    loop = true,
    reverseMode = false,
    variableSpeed,
    onSentenceComplete,
    startOnVisible = false,
    isVisible = true,
  }
) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [charPos, setCharPos] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef();

  useEffect(() => {
    if (!isVisible) return;
    const current = reverseMode
      ? [...textArray[idx]].reverse().join('')
      : textArray[idx];

    const step = () => {
      if (deleting) {
        if (!displayed) {
          onSentenceComplete?.(textArray[idx], idx);
          setIdx(prev => (prev + 1) % textArray.length);
          setDeleting(false);
          timeout.current = setTimeout(step, pauseDuration);
        } else {
          setDisplayed(d => d.slice(0, -1));
          timeout.current = setTimeout(step, deletingSpeed);
        }
      } else if (charPos < current.length) {
        setDisplayed(d => d + current[charPos]);
        setCharPos(p => p + 1);
        const speed = variableSpeed
          ? Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min
          : typingSpeed;
        timeout.current = setTimeout(step, speed);
      } else if (textArray.length > 1) {
        timeout.current = setTimeout(() => setDeleting(true), pauseDuration);
      }
    };

    timeout.current = setTimeout(step, initialDelay);
    return () => clearTimeout(timeout.current);
  }, [
    idx,
    charPos,
    deleting,
    textArray,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
    loop,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
    isVisible,
    startOnVisible,
    displayed
  ]);

  return displayed;
}
