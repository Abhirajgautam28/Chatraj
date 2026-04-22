import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ResizablePanel = ({
  children,
  initialWidth = 384,
  minWidth = 320,
  maxWidth = 600,
  direction = 'right', // 'left' or 'right'
  onResize
}) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing.current) return;

    let newWidth;
    if (direction === 'right') {
        newWidth = e.clientX;
    } else {
        newWidth = window.innerWidth - e.clientX;
    }

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
      if (onResize) onResize(newWidth);
    }
  }, [minWidth, maxWidth, direction, onResize]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div style={{ width, display: 'flex', position: 'relative', flexShrink: 0 }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/30 transition-colors z-50 ${direction === 'right' ? 'right-0' : 'left-0'}`}
      />
    </div>
  );
};

ResizablePanel.propTypes = {
  children: PropTypes.node.isRequired,
  initialWidth: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  direction: PropTypes.oneOf(['left', 'right']),
  onResize: PropTypes.func
};

export default React.memo(ResizablePanel);
