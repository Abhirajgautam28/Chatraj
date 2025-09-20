import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useVisibility } from '../hooks/useVisibility';
import { useTypingEffect } from '../hooks/useTypingEffect';

export default function TextType({
    text,
    as: Component = 'div',
    typingSpeed = 50,
    initialDelay = 0,
    pauseDuration = 2000,
    deletingSpeed = 30,
    loop = true,
    className = '',
    showCursor = true,
    hideCursorWhileTyping = false,
    cursorCharacter = '|',
    cursorClassName = '',
    cursorBlinkDuration = 0.5,
    textColors = [],
    variableSpeed,
    onSentenceComplete,
    startOnVisible = false,
    reverseMode = false,
    ...props
}) {
    const containerRef = useRef();
    const textArray = Array.isArray(text) ? text : [text];
    const isVisible = useVisibility(containerRef, { threshold: 0.1 });
    const displayed = useTypingEffect(textArray, {
        typingSpeed,
        deletingSpeed,
        pauseDuration,
        loop,
        reverseMode,
        initialDelay,
        variableSpeed,
        onSentenceComplete,
        startOnVisible,
        isVisible
    });
    const shouldHideCursor = hideCursorWhileTyping && (displayed.length < textArray[0].length || displayed.length === 0);

    return (
        <Component
            ref={containerRef}
            className={`inline-block whitespace-pre-wrap tracking-tight ${className}`}
            aria-live="polite"
            aria-atomic="true"
            role="status"
            {...props}
        >
            <span className="inline" style={{ color: textColors[0] || '#ffffff' }}>
                {displayed}
            </span>
            {showCursor && (
                <span
                    className={`ml-1 cursor ${shouldHideCursor ? 'hidden' : ''} ${cursorClassName}`}
                    style={{ '--cursor-blink-duration': `${cursorBlinkDuration}s` }}
                >
                    {cursorCharacter}
                </span>
            )}
        </Component>
    );
}

TextType.propTypes = {
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    as: PropTypes.elementType,
    typingSpeed: PropTypes.number,
    initialDelay: PropTypes.number,
    pauseDuration: PropTypes.number,
    deletingSpeed: PropTypes.number,
    loop: PropTypes.bool,
    className: PropTypes.string,
    showCursor: PropTypes.bool,
    hideCursorWhileTyping: PropTypes.bool,
    cursorCharacter: PropTypes.string,
    cursorClassName: PropTypes.string,
    cursorBlinkDuration: PropTypes.number,
    textColors: PropTypes.arrayOf(PropTypes.string),
    variableSpeed: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }),
    onSentenceComplete: PropTypes.func,
    startOnVisible: PropTypes.bool,
    reverseMode: PropTypes.bool,
};
