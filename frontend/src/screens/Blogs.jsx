import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import * as THREE from 'three';
import BlogCard from '../components/BlogCard';
import 'remixicon/fonts/remixicon.css';


const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const heroRef = useRef(null);
    const threeRef = useRef(null);

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

    // Animate hero and cards
    useEffect(() => {
        if (!loading && heroRef.current) {
            anime({
                targets: heroRef.current,
                opacity: [0, 1],
                translateY: [80, 0],
                duration: 1200,
                easing: 'easeOutExpo',
            });
        }
        if (!loading) {
            anime({
                targets: '.blog-card-animated',
                opacity: [0, 1],
                translateY: [60, 0],
                delay: anime.stagger(120),
                duration: 900,
                easing: 'easeOutExpo',
            });
        }
    }, [blogs, loading]);

    // Three.js animated background for hero
    useEffect(() => {
        if (!loading && threeRef.current) {
            const localRef = threeRef.current;
            while (localRef.firstChild) {
                localRef.removeChild(localRef.firstChild);
            }
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, localRef.offsetWidth / 400, 0.1, 1000);
            camera.position.z = 4;
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(localRef.offsetWidth, 400);
            localRef.appendChild(renderer.domElement);
            const spheres = [];
            for (let i = 0; i < 8; i++) {
                const geometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.15, 32, 32);
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(`hsl(${Math.random() * 360}, 80%, 60%)`),
                    roughness: 0.3,
                    metalness: 0.7,
                    transparent: true,
                    opacity: 0.85,
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(Math.random() * 6 - 3, Math.random() * 2 - 1, Math.random() * 2 - 1);
                scene.add(sphere);
                spheres.push(sphere);
            }
            const light = new THREE.PointLight(0xffffff, 1.2, 100);
            light.position.set(0, 2, 6);
            scene.add(light);
            let frameId;
            const animate = () => {
                spheres.forEach((sphere, i) => {
                    sphere.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
                    sphere.position.x += Math.cos(Date.now() * 0.0012 + i) * 0.0015;
                    sphere.rotation.x += 0.005;
                    sphere.rotation.y += 0.007;
                });
                renderer.render(scene, camera);
                frameId = requestAnimationFrame(animate);
            };
            animate();
            return () => {
                cancelAnimationFrame(frameId);
                renderer.dispose();
                while (localRef.firstChild) {
                    localRef.removeChild(localRef.firstChild);
                }
            };
        }
    }, [loading, blogs]);

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
            {/* Hero Section with Three.js Canvas */}
            <section ref={heroRef} className="relative flex items-center justify-center h-[420px] md:h-[480px] bg-gradient-to-br from-blue-900 via-gray-900 to-blue-800 overflow-hidden">
                <div ref={threeRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-lg animate__animated animate__fadeInDown">The Dev&apos;s Diary</h1>
                    <p className="text-2xl md:text-3xl text-blue-200 font-medium mb-2 animate__animated animate__fadeInUp">
                        Journeys in code, creativity, and community.
                    </p>
                    <Link to="/blogs/create">
                        <button
                            className="mt-8 px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 text-xl animate__animated animate__fadeInUp"
                        >
                            <i className="ri-add-line mr-2"></i> Create New Post
                        </button>
                    </Link>
                </div>
            </section>
            {/* Blog Cards Grid */}
            <section className="container px-4 py-16 mx-auto">
                {loading ? (
                    <div className="text-center text-2xl font-semibold animate-pulse">Loading...</div>
                ) : (
                    <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {blogs.map((blog) => (
                            <div key={blog._id} className="blog-card-animated">
                                <BlogCard blog={blog} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blogs;
