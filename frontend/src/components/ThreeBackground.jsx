import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { ThemeContext } from '../context/theme.context';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    // Set background color based on theme, or keep transparent
    // scene.background = new THREE.Color(isDarkMode ? 0x111827 : 0xf3f4f6);
    // We'll keep it transparent to overlay on existing gradient

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Object: Rotating Icosahedron (Techy feel)
    const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Radius 1.5, Detail 1
    const material = new THREE.MeshBasicMaterial({
      color: isDarkMode ? 0x3b82f6 : 0x2563eb, // Blue
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      // Spread particles around
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: isDarkMode ? 0x60a5fa : 0x3b82f6,
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);


    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      sphere.rotation.x += 0.002;
      sphere.rotation.y += 0.002;

      particlesMesh.rotation.y -= 0.001;
      particlesMesh.rotation.x -= 0.0005;

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
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        position: 'fixed', // Fixed to cover viewport while scrolling
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Behind content
        opacity: 0.6 // Subtle effect
      }}
    />
  );
};

export default ThreeBackground;
