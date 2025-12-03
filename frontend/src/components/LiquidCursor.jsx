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

        // defs filter for gooey effect
        const defs = document.createElementNS(svgNS, 'defs');
        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', 'gooey');
        const feGaussian = document.createElementNS(svgNS, 'feGaussianBlur');
        feGaussian.setAttribute('in', 'SourceGraphic');
        feGaussian.setAttribute('stdDeviation', '12');
        feGaussian.setAttribute('result', 'blur');
        const feColorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
        feColorMatrix.setAttribute('in', 'blur');
        feColorMatrix.setAttribute('mode', 'matrix');
        // The last row amplifies alpha and thresholds to create merging blobs
        feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10');

        filter.appendChild(feGaussian);
        filter.appendChild(feColorMatrix);
        defs.appendChild(filter);
        svg.appendChild(defs);

        // group that will be filtered (gooey)
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('filter', 'url(#gooey)');
        svg.appendChild(g);

        // create circle elements
        const BLOBS = 9;
        const circles = [];
        for (let i = 0; i < BLOBS; i++) {
            const c = document.createElementNS(svgNS, 'circle');
            c.setAttribute('cx', '-100');
            c.setAttribute('cy', '-100');
            c.setAttribute('r', String(10 + i * 2));
            // color; use hsl to give a subtle gradient across blobs
            c.setAttribute('fill', `hsl(${(i * 36) % 360} 90% 60%)`);
            c.setAttribute('fill-opacity', '0.85');
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
        const blobs = [];
        for (let i = 0; i < BLOBS; i++) {
            blobs.push({ x: -100, y: -100, r: 10 + i * 2 });
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
                const followFactor = 0.12 + i * 0.02;
                // introduce lateral wave perpendicular to movement
                const wave = Math.sin(elapsed * 6 + i * 0.6) * (6 + i * 1.2);

                b.x = lerp(b.x, tx + wave, followFactor);
                b.y = lerp(b.y, ty + Math.cos(elapsed * 4 + i * 0.4) * 4, followFactor);

                // radius pulse when pointer is down
                const base = 8 + i * 1.6;
                b.r = lerp(b.r, pointer.down ? base * 1.9 : base, 0.08);

                // set for next blob to follow previous
                tx = b.x - (i * 6); // slight offset along x so blobs form a tail
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
