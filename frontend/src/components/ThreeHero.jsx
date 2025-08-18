import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

function ThreeHero({
  width = 180,
  height = 180,
  className = '',
  geometryConfig = { type: 'torus', args: [1.1, 0.28, 48, 120] },
  materialConfig = {
    color: 0xffffff,
    metalness: 0.15,
    roughness: 0.08,
    transmission: 0.92,
    thickness: 1.2,
    transparent: true,
    opacity: 0.7,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    ior: 1.45,
    reflectivity: 0.18,
    sheen: 0.2,
  },
  lightingConfig = {
    ambient: { color: 0xffffff, intensity: 0.9 },
    directional: { color: 0xffffff, intensity: 0.25, position: [0, 2, 4] },
  },
}) {
  const threeRef = useRef(null);
  useEffect(() => {
    if (!threeRef.current) return;
    const localRef = threeRef.current;
    while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0); // transparent
    renderer.setSize(width, height);
    localRef.appendChild(renderer.domElement);
    // Lighting
    const ambient = new THREE.AmbientLight(lightingConfig.ambient.color, lightingConfig.ambient.intensity);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(lightingConfig.directional.color, lightingConfig.directional.intensity);
    dirLight.position.set(...lightingConfig.directional.position);
    scene.add(dirLight);
    // Atom-like 3D logo: central sphere + 3 orbiting rings (torus) + 3 small electron spheres
    // Central nucleus
    const nucleusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2196f3,
      metalness: 0.5,
      roughness: 0.2,
      transmission: 0.7,
      thickness: 1.2,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      ior: 1.45,
      reflectivity: 0.25,
      sheen: 0.3,
      emissive: 0x1565c0,
      emissiveIntensity: 0.15,
    });
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), nucleusMaterial);
    scene.add(nucleus);

    // Orbiting rings
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      ior: 1.45,
      reflectivity: 0.18,
      sheen: 0.2,
      emissive: 0x2196f3,
      emissiveIntensity: 0.08,
    });
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.07, 32, 120),
        ringMaterial
      );
      ring.rotation.x = Math.PI / 2 * (i + 1) / 2;
      ring.rotation.y = Math.PI / 3 * i;
      scene.add(ring);
      rings.push(ring);
    }

    // Electrons (small spheres on each ring)
    const electronMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffeb3b,
      metalness: 0.6,
      roughness: 0.15,
      transmission: 0.8,
      thickness: 1.1,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      ior: 1.45,
      reflectivity: 0.22,
      sheen: 0.25,
      emissive: 0xffc107,
      emissiveIntensity: 0.18,
    });
    const electrons = [];
    for (let i = 0; i < 3; i++) {
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 32), electronMaterial);
      scene.add(electron);
      electrons.push(electron);
    }
    // Soft shadow (fake, blurred ellipse)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 32;
    const ctx = shadowCanvas.getContext('2d');
    ctx.filter = 'blur(6px)';
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(64, 16, 48, 10, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true });
    const shadowGeo = new THREE.PlaneGeometry(2.2, 0.5);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadowMesh.position.y = -1.25;
    shadowMesh.rotation.x = -Math.PI / 2;
    scene.add(shadowMesh);
    // Animation: rotate nucleus and rings, animate electrons
    let frameId;
    let t = 0;
    const animate = () => {
      t += 0.012;
      nucleus.rotation.x += 0.007;
      nucleus.rotation.y += 0.012;
      rings.forEach((ring, i) => {
        ring.rotation.z += 0.008 + i * 0.003;
      });
      // Move electrons along their rings
      electrons.forEach((electron, i) => {
        const angle = t + i * (2 * Math.PI / 3);
        const r = 1.1;
        const y = Math.sin(angle + i) * 0.25;
        electron.position.x = Math.cos(angle) * r;
        electron.position.y = y;
        electron.position.z = Math.sin(angle) * r;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      nucleus.geometry.dispose && nucleus.geometry.dispose();
      nucleus.material.dispose && nucleus.material.dispose();
      rings.forEach(ring => {
        ring.geometry.dispose && ring.geometry.dispose();
        ring.material.dispose && ring.material.dispose();
      });
      electrons.forEach(electron => {
        electron.geometry.dispose && electron.geometry.dispose();
        electron.material.dispose && electron.material.dispose();
      });
      shadowMaterial.dispose && shadowMaterial.dispose();
      shadowGeo.dispose && shadowGeo.dispose();
      shadowTexture.dispose && shadowTexture.dispose();
      while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
    };
  }, [width, height, geometryConfig, materialConfig, lightingConfig]);
  return (
    <div ref={threeRef} className={className} style={{ width, height, zIndex: 1 }} />
  );
}

ThreeHero.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  geometryConfig: PropTypes.object,
  materialConfig: PropTypes.object,
  lightingConfig: PropTypes.object,
};

export default ThreeHero;