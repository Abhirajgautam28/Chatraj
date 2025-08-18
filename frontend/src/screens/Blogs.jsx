
import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import * as THREE from 'three';
import anime from 'animejs';
import 'remixicon/fonts/remixicon.css';


const Blogs = () => {

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const threeRef = useRef(null);
    const heroRef = useRef(null);
    // Subtle 3D glass card in hero (Material-inspired)
    useEffect(() => {
        if (!threeRef.current) return;
        const localRef = threeRef.current;
        while (localRef.firstChild) localRef.removeChild(localRef.firstChild);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        camera.position.z = 4;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(180, 180);
        localRef.appendChild(renderer.domElement);
        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const point = new THREE.PointLight(0x2196f3, 1, 100);
        point.position.set(2, 2, 5);
        scene.add(point);
        // Glass card (rounded box)
        const geometry = new THREE.BoxGeometry(2.2, 2.2, 0.25, 32, 32, 1);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.1,
            transmission: 0.85,
            thickness: 0.5,
            transparent: true,
            opacity: 0.7,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 0;
        scene.add(mesh);
        // Animation
        let frameId;
        const animate = () => {
            mesh.rotation.x += 0.008;
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
    }, []);

    // Smooth fade/slide-in for hero and blog cards
    useEffect(() => {
        if (heroRef.current) {
            anime({
                targets: heroRef.current,
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 900,
                easing: 'easeOutExpo',
            });
        }
        anime({
            targets: '.blog-card-animated',
            opacity: [0, 1],
            translateY: [40, 0],
            delay: anime.stagger(120),
            duration: 800,
            easing: 'easeOutExpo',
        });
    }, [blogs, loading]);


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
            {/* Hero Section with subtle 3D glass card */}
            <section ref={heroRef} className="w-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{minHeight:'420px'}}>
                <div ref={threeRef} className="absolute left-8 top-8 md:left-16 md:top-10" style={{ width: 180, height: 180, zIndex: 1 }} />
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
