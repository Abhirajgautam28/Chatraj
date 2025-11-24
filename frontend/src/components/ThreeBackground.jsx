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
        currentMount.appendChild(renderer.domElement);
    } catch (e) {
        console.warn('WebGL not supported or failed to initialize:', e);
        return;
    }

    // Particles - Using InstancedMesh for Spheres
    const particlesCount = 700;
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.6,
      color: 0xffffff,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, particlesCount);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
      // Position
      dummy.position.x = (Math.random() - 0.5) * 15;
      dummy.position.y = (Math.random() - 0.5) * 15;
      dummy.position.z = (Math.random() - 0.5) * 15;

      dummy.rotation.x = Math.random() * 2 * Math.PI;
      dummy.rotation.y = Math.random() * 2 * Math.PI;

      const scale = Math.random();
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Random Color
      if (Math.random() > 0.5) {
          color.setHex(isDarkMode ? 0x60a5fa : 0x3b82f6); // Blueish
      } else {
          color.setHex(Math.random() * 0xffffff); // Random
      }
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
        zIndex: -1, // Behind everything
        opacity: 1 // Background should be fully opaque (or handled by gradient)
      }}
    />
  );
};

export default ThreeBackground;
