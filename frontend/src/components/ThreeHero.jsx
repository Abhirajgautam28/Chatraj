import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import PropTypes from 'prop-types';


function ThreeHero({ width = 180, height = 180, className = '' }) {
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
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
    dirLight.position.set(0, 2, 4);
    scene.add(dirLight);
    // Minimal glass ring (torus)
    const geometry = new THREE.TorusGeometry(1.1, 0.28, 48, 120);
    const material = new THREE.MeshPhysicalMaterial({
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
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    scene.add(mesh);
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
    // Animation: slow, elegant rotation
    let frameId;
    const animate = () => {
      mesh.rotation.x += 0.007;
      mesh.rotation.y += 0.012;
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

ThreeHero.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
};

export default ThreeHero;