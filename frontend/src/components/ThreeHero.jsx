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
    // Geometry
    let geometry;
    if (geometryConfig.type === 'torus') {
      geometry = new THREE.TorusGeometry(...geometryConfig.args);
    } else if (geometryConfig.type === 'box') {
      geometry = new THREE.BoxGeometry(...geometryConfig.args);
    } else if (geometryConfig.type === 'sphere') {
      geometry = new THREE.SphereGeometry(...geometryConfig.args);
    } else {
      geometry = new THREE.TorusGeometry(1.1, 0.28, 48, 120);
    }
    const material = new THREE.MeshPhysicalMaterial(materialConfig);
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
    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose && geometry.dispose();
      material.dispose && material.dispose();
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