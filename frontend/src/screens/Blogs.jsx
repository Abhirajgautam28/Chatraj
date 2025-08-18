
import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import * as THREE from 'three';
import 'remixicon/fonts/remixicon.css';


const Blogs = () => {

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const threeRef = useRef(null);
    // 3D animated assets in hero and background
    useEffect(() => {
        if (!threeRef.current) return;
        const localRef = threeRef.current;
        while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, localRef.offsetWidth / localRef.offsetHeight, 0.1, 1000);
        camera.position.z = 8;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(localRef.offsetWidth, localRef.offsetHeight);
        localRef.appendChild(renderer.domElement);
        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const point = new THREE.PointLight(0x2196f3, 1, 100);
        point.position.set(2, 2, 10);
        scene.add(point);
        // 3D Assets: 20-30 shapes
        const shapes = [];
        const shapeTypes = [
            () => new THREE.IcosahedronGeometry(Math.random() * 0.7 + 0.5, 0),
            () => new THREE.TorusGeometry(Math.random() * 0.5 + 0.3, 0.15, 16, 100),
            () => new THREE.SphereGeometry(Math.random() * 0.5 + 0.3, 32, 32),
            () => new THREE.ConeGeometry(Math.random() * 0.5 + 0.3, 1, 32),
            () => new THREE.BoxGeometry(Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.3),
        ];
        for (let i = 0; i < 25; i++) {
            const geometry = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]();
            const color = new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`);
            const material = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3, flatShading: true, transparent: true, opacity: 0.85 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                Math.random() * 12 - 6,
                Math.random() * 4 - 2,
                Math.random() * 6 - 3
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            mesh.userData = {
                rotSpeedX: Math.random() * 0.01 + 0.005,
                rotSpeedY: Math.random() * 0.01 + 0.005,
                floatSpeed: Math.random() * 0.003 + 0.001,
                floatPhase: Math.random() * Math.PI * 2,
            };
            scene.add(mesh);
            shapes.push(mesh);
        }
        // Animation
        let frameId;
        const animate = () => {
            const t = Date.now() * 0.001;
            shapes.forEach((mesh) => {
                mesh.rotation.x += mesh.userData.rotSpeedX;
                mesh.rotation.y += mesh.userData.rotSpeedY;
                mesh.position.y += Math.sin(t + mesh.userData.floatPhase) * mesh.userData.floatSpeed;
            });
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            cancelAnimationFrame(frameId);
            renderer.dispose();
            while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
        };
    }, []);


    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                setBlogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);



    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Hero Section with 3D assets */}
            <section className="w-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{minHeight:'420px'}}>
                <div ref={threeRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{minHeight:'420px'}} />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center text-blue-700 dark:text-blue-300">Blog Posts</h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 text-center">Read the latest from our community</p>
                    <Link to="/blogs/create">
                        <button className="mt-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-all duration-200">
                            <i className="ri-add-line mr-2"></i> Create New Post
                        </button>
                    </Link>
                </div>
            </section>
            {/* Blog Cards Grid */}
            <section className="container px-4 py-12 mx-auto">
                {loading ? (
                    <div className="text-center text-2xl font-semibold animate-pulse">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blogs;
