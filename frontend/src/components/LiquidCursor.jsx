import React, { useEffect, useRef } from 'react';

// Lightweight liquid cursor trail using canvas. No external deps.
const LiquidCursor = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = mountRef.current;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Particles that follow cursor
    const blobs = [];
    const BLOBS = 8; // number of trail blobs
    for (let i = 0; i < BLOBS; i++) {
      blobs.push({ x: -100, y: -100, vx: 0, vy: 0, r: 8 + i * 2 });
    }

    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };

    const onPointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onPointerDown = () => { pointer.down = true; };
    const onPointerUp = () => { pointer.down = false; };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    let rafId = null;

    const lerp = (a, b, t) => a + (b - a) * t;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // draw blurred, additive blobs for liquid look
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'blur(10px)';

      let tx = pointer.x;
      let ty = pointer.y;

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        // follow previous point with easing
        b.x = lerp(b.x, tx, 0.18 + i * 0.01);
        b.y = lerp(b.y, ty, 0.18 + i * 0.01);

        // increase radius slightly on pointer down for a swipe feel
        const baseR = 6 + i * 1.6;
        b.r = lerp(b.r, pointer.down ? baseR * 2.2 : baseR, 0.12);

        // color shifts across blobs
        const hue = (i * 36 + (Date.now() / 30)) % 360;
        ctx.fillStyle = `hsla(${hue}, 90%, ${pointer.down ? 60 : 55}%, ${0.18})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        tx = b.x;
        ty = b.y;
      }

      ctx.restore();

      // Optional subtle sharp overlay to give liquid edges
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.filter = 'none';
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const hue = (i * 36 + (Date.now() / 30)) % 360;
        ctx.fillStyle = `hsla(${hue}, 95%, 55%, ${0.06})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, Math.max(1, b.r - 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (container && canvas) container.removeChild(canvas);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none" />;
};

export default LiquidCursor;
