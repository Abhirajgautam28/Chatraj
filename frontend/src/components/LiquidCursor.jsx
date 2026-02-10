import React, { useEffect, useRef } from 'react';

// SVG-based gooey liquid cursor (metaball / wave style)
// Uses an SVG filter (blur + color-matrix) to merge circles into a liquid wave.
const LiquidCursor = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const container = mountRef.current;

        // Create SVG element
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'fixed';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '9999';

        // defs filter for gooey effect (tuned for a more minimal, transparent water feel)
        const defs = document.createElementNS(svgNS, 'defs');
        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', 'gooey');
        const feGaussian = document.createElementNS(svgNS, 'feGaussianBlur');
        feGaussian.setAttribute('in', 'SourceGraphic');
        // gentler blur for a clear, water-like look
        feGaussian.setAttribute('stdDeviation', '4');
        feGaussian.setAttribute('result', 'blur');
        const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
        feColorMatrix.setAttribute('in', 'blur');
        feColorMatrix.setAttribute('mode', 'matrix');
        // softer alpha amplification for a more transparent, watery appearance
        feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 10 -5');

        filter.appendChild(feGaussian);
        filter.appendChild(feColorMatrix);
        defs.appendChild(filter);
        svg.appendChild(defs);

        // group that will be filtered (gooey)
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('filter', 'url(#gooey)');
        // subtle blend mode for a translucent water effect
        try { g.style.mixBlendMode = 'screen'; } catch { void 0; }
        svg.appendChild(g);

        // create circle elements (watery-blue palette, transparent)
        const BLOBS = 6;
        const circles = [];
        for (let i = 0; i < BLOBS; i++) {
            const c = document.createElementNS(svgNS, 'circle');
            c.setAttribute('cx', '-100');
            c.setAttribute('cy', '-100');
            // smaller base radius and gentler growth
            c.setAttribute('r', String(6 + i * 1.2));
            // watery blue tones, slightly offset per blob
            const hue = 200 + (i * 6); // 200-230 range
            c.setAttribute('fill', `hsl(${hue} 85% 60%)`);
            // low opacity for transparent water-like color
            c.setAttribute('fill-opacity', '0.28');
            g.appendChild(c);
            circles.push(c);
        }

        container.appendChild(svg);

        let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };
        const onPointerMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; };
        const onPointerDown = () => { pointer.down = true; };
        const onPointerUp = () => { pointer.down = false; };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);

        // state for blobs
        // subtle blend mode for a translucent water effect
        try { g.style.mixBlendMode = 'screen'; } catch { void 0; }
        const blobs = [];
        for (let i = 0; i < BLOBS; i++) {
            blobs.push({ x: -100, y: -100, r: 6 + i * 1.2 });
        }

        const lerp = (a, b, t) => a + (b - a) * t;
        let rafId = null;
        let t0 = performance.now();

        const animate = (t) => {
            const elapsed = (t - t0) / 1000;

            // make blobs follow pointer with increasing delay and sine wave offset for liquid wave
            let tx = pointer.x;
            let ty = pointer.y;
            for (let i = 0; i < blobs.length; i++) {
                const b = blobs[i];
                // slightly faster smoothing for a gentler tail
                const followFactor = 0.18 + i * 0.015;
                // slower, smaller lateral wave for minimal motion
                const wave = Math.sin(elapsed * 3 + i * 0.5) * (3 + i * 0.6);

                b.x = lerp(b.x, tx + wave, followFactor);
                b.y = lerp(b.y, ty + Math.cos(elapsed * 2 + i * 0.35) * 2, followFactor);

                // radius pulse when pointer is down (subtle)
                const base = 6 + i * 1.2;
                b.r = lerp(b.r, pointer.down ? base * 1.4 : base, 0.06);

                // set for next blob to follow previous (smaller offset)
                tx = b.x - (i * 3);
                ty = b.y;

                // update circle element
                const c = circles[i];
                c.setAttribute('cx', String(b.x));
                c.setAttribute('cy', String(b.y));
                c.setAttribute('r', String(b.r));
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        // cleanup
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            if (container && svg) container.removeChild(svg);
        };
    }, []);

    return <div ref={mountRef} className="pointer-events-none" />;
};

export default LiquidCursor;
