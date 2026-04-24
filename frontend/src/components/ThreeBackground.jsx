import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * High-Performance 3D Background using Instanced Rendering.
 * Minimal CPU overhead, GPU-bound.
 */
const ThreeBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mount.appendChild(renderer.domElement);
        } catch (e) {
            console.error("WebGL Fail:", e);
            return;
        }

        const count = 1000;
        const geometry = new THREE.SphereGeometry(0.02, 6, 6);
        const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6 });
        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        const colors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

        for (let i = 0; i < count; i++) {
            const pos = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
            matrix.setPosition(pos);
            instancedMesh.setMatrixAt(i, matrix);
            color.set(colors[Math.floor(Math.random() * colors.length)]);
            instancedMesh.setColorAt(i, color);
        }

        scene.add(instancedMesh);

        let animationFrame;
        const animate = () => {
            animationFrame = requestAnimationFrame(animate);
            instancedMesh.rotation.y += 0.0005;
            instancedMesh.rotation.x += 0.0002;
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
            cancelAnimationFrame(animationFrame);
            if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="fixed inset-0 pointer-events-none -z-50" />;
};

export default React.memo(ThreeBackground);
