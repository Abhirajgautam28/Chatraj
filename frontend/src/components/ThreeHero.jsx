import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import PropTypes from 'prop-types';

ThreeHero.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
};

export default function ThreeHero({ width = 180, height = 180, className = '' }) {
  const threeRef = useRef(null);
  useEffect(() => {
    if (!threeRef.current) return;
    const localRef = threeRef.current;
    while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    localRef.appendChild(renderer.domElement);
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const point = new THREE.PointLight(0xff00ff, 1.5, 100);
    point.position.set(2, 2, 5);
    scene.add(point);
    // New 3D: Spinning torus knot with color animation
    const geometry = new THREE.TorusKnotGeometry(1, 0.35, 120, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8e44ad,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.7,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: 0x8e44ad,
      emissiveIntensity: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    // Glow effect (fake bloom)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.13, 0.45, 120, 16), glowMaterial);
    scene.add(glowMesh);
    // Animation: rotate, color shift
    let frameId;
    let t = 0;
    const animate = () => {
      t += 0.012;
      mesh.rotation.x += 0.013;
      mesh.rotation.y += 0.017;
      glowMesh.rotation.x = mesh.rotation.x * 1.1;
      glowMesh.rotation.y = mesh.rotation.y * 1.1;
      // Color shift
      const hue = (Math.sin(t) * 0.5 + 0.5) * 0.7 + 0.2;
      const color = new THREE.Color().setHSL(hue, 0.85, 0.55);
      material.color = color;
      material.emissive = color;
      glowMaterial.color = color;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
    };
  }, [width, height]);
  return (
    <div ref={threeRef} className={className} style={{ width, height, zIndex: 1 }} />
  );
}