import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import PropTypes from 'prop-types';

export default function ThreeHero({ width = 180, height = 180, className = '' }) {
ThreeHero.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
};
  const threeRef = useRef(null);
  useEffect(() => {
    if (!threeRef.current) return;
    const localRef = threeRef.current;
    while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 4;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    localRef.appendChild(renderer.domElement);
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 1.2, 100);
    point.position.set(2, 2, 5);
    scene.add(point);
    // Glowing, color-shifting icosahedron
    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x00eaff,
      metalness: 0.7,
      roughness: 0.15,
      transmission: 0.7,
      thickness: 0.7,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: 0x00eaff,
      emissiveIntensity: 0.7,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    // Glow effect (fake bloom)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 1), glowMaterial);
    scene.add(glowMesh);
    // Animation: rotate, pulse, color shift
    let frameId;
    let t = 0;
    const animate = () => {
      t += 0.015;
      mesh.rotation.x += 0.012;
      mesh.rotation.y += 0.018;
      glowMesh.rotation.x = mesh.rotation.x * 1.1;
      glowMesh.rotation.y = mesh.rotation.y * 1.1;
      // Color shift
      const hue = (Math.sin(t) * 0.5 + 0.5) * 0.7 + 0.2;
      const color = new THREE.Color().setHSL(hue, 0.85, 0.55);
      material.color = color;
      material.emissive = color;
      glowMaterial.color = color;
      // Pulse
      const scale = 1 + Math.sin(t * 2) * 0.08;
      mesh.scale.set(scale, scale, scale);
      glowMesh.scale.set(scale * 1.1, scale * 1.1, scale * 1.1);
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