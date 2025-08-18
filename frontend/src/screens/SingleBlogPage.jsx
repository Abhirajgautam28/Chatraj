
import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import anime from 'animejs';
import * as THREE from 'three';
import 'remixicon/fonts/remixicon.css';


const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [progress] = useState(0);
    const { id } = useParams();
    const contentRef = useRef(null);
    const heroRef = useRef(null);
    const threeRef = useRef(null);

    // Fetch blog data
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/blogs/${id}`);
                setBlog(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    // Animate hero and content
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
        if (!loading && contentRef.current) {
            anime({
                targets: contentRef.current.querySelectorAll('.prose > *'),
                opacity: [0, 1],
                translateY: [60, 0],
                delay: anime.stagger(120),
                duration: 900,
                easing: 'easeOutExpo',
            });
        }
    }, [blog, loading]);

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
    }, [loading, blog]);


    const handleLike = async () => {
        try {
            const response = await axios.post(`/api/blogs/like/${id}`);
            setBlog(response.data);
            anime({
                targets: '.like-btn',
                scale: [1, 1.25, 1],
                duration: 500,
                easing: 'easeInOutQuad',
            });
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/blogs/comment/${id}`, { text: comment });
            setBlog(response.data);
            setComment('');
        } catch (error) {
            console.error('Error commenting on blog:', error);
        }
    };

    const renderContent = (content) => {
        try {
            const blocks = JSON.parse(content);
            return blocks.map(block => {
                if (block.type === 'text') return <p key={block.id} className="my-4 text-lg leading-relaxed">{block.content}</p>;
                if (block.type === 'image') return <img key={block.id} src={block.content} alt="blog content" className="my-8 rounded-lg shadow-lg" />;
                if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="blog video" className="my-8 w-full aspect-video rounded-lg" />;
                if (block.type === 'code') return <pre key={block.id}><code className="language-javascript bg-gray-900 text-white p-4 rounded-lg block overflow-x-auto">{block.content}</code></pre>;
                if (block.type === 'quote') return <blockquote key={block.id} className="my-8 p-4 border-l-4 border-blue-400 bg-gray-800 italic">{block.content}</blockquote>;
                return null;
            });
        } catch {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-3xl animate-pulse">Loading...</div>;
    }

    if (!blog) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-3xl">Blog not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
            {/* Animated progress bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-700 z-50">
                <div className="h-full bg-gradient-to-r from-blue-400 to-teal-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            {/* Hero Section with Three.js Canvas */}
            <section ref={heroRef} className="relative flex items-center justify-center h-[420px] md:h-[480px] bg-gradient-to-br from-blue-900 via-gray-900 to-blue-800 overflow-hidden">
                <div ref={threeRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-lg animate__animated animate__fadeInDown">{blog.title}</h1>
                    <p className="text-lg md:text-2xl text-blue-200 font-medium mb-2 animate__animated animate__fadeInUp">
                        By {blog.author.firstName} {blog.author.lastName}
                    </p>
                </div>
            </section>
            {/* Blog Content */}
            <main className="container px-4 py-12 mx-auto" ref={contentRef}>
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                        {renderContent(blog.content)}
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between mt-16 border-t border-gray-700 pt-8 gap-6">
                        <button
                            onClick={handleLike}
                            className="like-btn flex items-center gap-2 px-8 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg hover:from-pink-600 hover:to-red-600 transition-all duration-300 text-xl"
                        >
                            <i className="ri-heart-fill text-2xl"></i> {blog.likes.length} <span className="hidden md:inline">Likes</span>
                        </button>
                        <div className="flex gap-4">
                            <a href={`https://twitter.com/intent/tweet?text=${blog.title}`} target="_blank" rel="noreferrer" className="text-3xl hover:text-blue-400 transition-colors duration-300"><i className="ri-twitter-fill"></i></a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer" className="text-3xl hover:text-blue-600 transition-colors duration-300"><i className="ri-facebook-box-fill"></i></a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`} target="_blank" rel="noreferrer" className="text-3xl hover:text-blue-500 transition-colors duration-300"><i className="ri-linkedin-box-fill"></i></a>
                        </div>
                    </div>
                </div>
            </main>
            {/* Comments Section */}
            <section className="py-16 bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-blue-200 animate__animated animate__fadeIn">Comments</h2>
                        <form onSubmit={handleComment} className="mb-12 animate__animated animate__fadeInUp">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-32 p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Join the discussion..."
                                required
                            ></textarea>
                            <button type="submit" className="px-8 py-3 mt-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">Post Comment</button>
                        </form>
                        <div className="space-y-8 animate__animated animate__fadeInUp">
                            {blog.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-4 items-center">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                                        {comment.user.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-blue-100">{comment.user.firstName} {comment.user.lastName}</p>
                                        <p className="text-gray-300 text-base">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            {/* Related Posts Section (placeholder) */}
            <section className="py-16 bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-blue-200 animate__animated animate__fadeIn">Related Posts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate__animated animate__fadeInUp">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 text-white">Related Post {i}</h3>
                                        <p className="text-gray-400">This is a placeholder for a related blog post.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SingleBlogPage;
