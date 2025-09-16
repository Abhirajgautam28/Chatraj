import PropTypes from 'prop-types';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useScramble } from '../hooks/useScramble';
import { useIntersection } from '../hooks/useIntersection';

const styles = {
  wrapper: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  as = 'span',
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  // Debounce hover events to avoid stacking intervals
  const hoverTimeout = useRef();
  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setIsHovering(true), 10);
  }, []);
  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setIsHovering(false), 10);
  }, []);

  const { displayText, revealedSet, isScrambling } = useScramble({
    text, isHovering, speed, maxIterations,
    sequential, revealDirection, useOriginalCharsOnly, characters
  });

  // Intersection observer for animateOn="view" or "both"
  useIntersection(
    containerRef,
    entries => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setIsHovering(true);
        setHasAnimated(true);
      }
    },
    { threshold: 0.1 }
  );

  const hoverProps =
    animateOn === 'hover' || animateOn === 'both'
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        }
      : {};

  // Render as span by default; use 'as' prop for heading tags if explicitly set
  const Tag = as || 'span';

  return (
    <motion.span className={parentClassName} ref={containerRef} style={styles.wrapper} {...hoverProps} {...props}>
      <Tag style={styles.srOnly}>{displayText}</Tag>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealedOrDone = revealedSet.has(index) || !isScrambling || !isHovering;
          return (
            <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}

DecryptedText.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  maxIterations: PropTypes.number,
  sequential: PropTypes.bool,
  revealDirection: PropTypes.oneOf(['start', 'end', 'center']),
  useOriginalCharsOnly: PropTypes.bool,
  characters: PropTypes.string,
  className: PropTypes.string,
  parentClassName: PropTypes.string,
  encryptedClassName: PropTypes.string,
  animateOn: PropTypes.oneOf(['hover', 'view', 'both']),
  as: PropTypes.string,
};
