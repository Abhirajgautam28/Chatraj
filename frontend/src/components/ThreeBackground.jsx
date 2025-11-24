import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { ThemeContext } from '../context/theme.context';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext);

  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      // Make sure the canvas doesn't capture pointer events and blends nicely with page
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.mixBlendMode = 'screen';
      currentMount.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported or failed to initialize:', e);
      return;
    }

    // Particles - Using InstancedMesh for Spheres
    const particlesCount = 700;
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    // Use vertex colors so each instance can be colored individually
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      depthWrite: false
    });

    const mesh = new THREE.InstancedMesh(geometry, material, particlesCount);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // A bright palette to keep particles visible in light & dark modes
    const palette = [
      '#60a5fa', // blue
      '#f472b6', // pink
      '#fbbf24', // yellow
      '#34d399', // green
      '#f97316', // orange
      '#a78bfa', // purple
      '#06b6d4', // cyan
      '#ef4444', // red
      '#ff7ab6',
      '#ffd166'
    ];

    for (let i = 0; i < particlesCount; i++) {
      // Position
      dummy.position.x = (Math.random() - 0.5) * 15;
      dummy.position.y = (Math.random() - 0.5) * 15;
      dummy.position.z = (Math.random() - 0.5) * 15;

      dummy.rotation.x = Math.random() * 2 * Math.PI;
      dummy.rotation.y = Math.random() * 2 * Math.PI;

      // Slightly constrained scale for better visibility
      const scale = Math.random() * 0.9 + 0.1;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Pick a color from the palette (randomized)
      const c = palette[Math.floor(Math.random() * palette.length)];
      color.set(c);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    scene.add(mesh);


    // Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      mesh.rotation.y -= 0.001;
      mesh.rotation.x -= 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isDarkMode, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900' : 'bg-gray-50'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Place canvas behind app content but above page background
        opacity: 1 // Background should be fully opaque (or handled by gradient)
      }}
    />
  );
};

export default ThreeBackground;
