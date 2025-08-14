import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'remixicon/fonts/remixicon.css';

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const heroRef = useRef(null);

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

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
            });

            gsap.to(heroRef.current, {
                backgroundPosition: '50% 100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            gsap.from(".blog-card", {
                opacity: 0,
                y: 100,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: ".blogs-grid",
                    start: "top 80%",
                }
            });
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div ref={containerRef}>
                <div ref={heroRef} className="h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
                    <div className="h-full bg-black bg-opacity-50 flex flex-col justify-center items-center text-center">
                        <h1 className="text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">The Dev's Diary</h1>
                        <p className="text-2xl text-gray-300">
                            Journeys in code, creativity, and community.
                        </p>
                    </div>
                </div>

                <div className="container px-4 py-16 mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex gap-4">
                            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                                <option>Filter by Topic</option>
                            </select>
                            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                                <option>Sort by Date</option>
                            </select>
                        </div>
                        <Link to="/blogs/create">
                            <button
                                className="px-6 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <i className="ri-add-line mr-2"></i> Create New Post
                            </button>
                        </Link>
                    </div>
                    {loading ? (
                        <div className="text-center text-2xl font-semibold">Loading...</div>
                    ) : (
                        <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {blogs.map((blog) => (
                                <div
                                    key={blog._id}
                                    className="blog-card bg-gray-800 rounded-lg shadow-2xl overflow-hidden transform hover:-translate-y-4 transition-transform duration-500 group"
                                >
                                    <div className="p-8">
                                        <h2 className="mb-4 text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                                            <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                                        </h2>
                                        <p className="mb-6 text-gray-400">
                                            By {blog.author.firstName} {blog.author.lastName}
                                        </p>
                                        <p className="mb-8 text-gray-300 text-lg">
                                            {blog.content.substring(0, 150)}...
                                        </p>
                                        <div className="flex items-center justify-between text-gray-400">
                                            <Link
                                                to={`/blogs/${blog._id}`}
                                                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300 text-lg"
                                            >
                                                Read More &rarr;
                                            </Link>
                                            <div className="flex items-center text-lg">
                                                <i className="mr-2 ri-heart-fill text-red-500"></i> {blog.likes.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
