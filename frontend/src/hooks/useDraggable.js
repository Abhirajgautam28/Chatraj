import { useState, useEffect } from 'react';

export function useDraggable(ref) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMouseDown(e) {
      if (e.button !== 0) return;
      const rect = el.getBoundingClientRect();
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragging(true);
    }
    function onMouseMove(e) {
      if (!dragging) return;
      setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
    function onMouseUp() { setDragging(false); }

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, offset, ref]);

  const style = pos
    ? { left: pos.x, top: pos.y, transform: 'none', cursor: dragging ? 'grabbing' : 'grab' }
    : {};
  return { dragging, style };
}
