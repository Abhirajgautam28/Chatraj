import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ThemeContext } from '../context/theme.context';
import { logger } from '../utils/logger';

const ThreeBackground = ({
    count = 700,
    speed = 1.0,
    colors = ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#f97316', '#a78bfa', '#06b6d4', '#ef4444', '#ff7ab6', '#ffd166']
}) => {
  const mountRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.mixBlendMode = 'normal';
      currentMount.appendChild(renderer.domElement);
    } catch (e) {
      logger.warn('WebGL initialization failed:', e);
      return;
    }

    const geometry = new THREE.SphereGeometry(0.035, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      dummy.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = Math.random() * 0.9 + 0.1;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(colors[Math.floor(Math.random() * colors.length)]);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      mesh.rotation.y -= 0.001 * speed;
      mesh.rotation.x -= 0.0005 * speed;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
      geometry.dispose(); material.dispose(); renderer.dispose();
    };
  }, [isDarkMode, prefersReducedMotion, count, speed, colors]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none z-0 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900' : 'bg-gray-50'}`}
    />
  );
};

ThreeBackground.propTypes = {
    count: PropTypes.number,
    speed: PropTypes.number,
    colors: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(ThreeBackground);
