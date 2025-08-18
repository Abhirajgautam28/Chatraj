
import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import ThreeHero from '../components/ThreeHero';
import anime from 'animejs';
import 'remixicon/fonts/remixicon.css';


const Blogs = () => {

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
        // Removed threeRef, handled by ThreeHero
    const heroRef = useRef(null);
    // Subtle 3D glass card in hero (Material-inspired)
        // ...removed Three.js setup, now using <ThreeHero />

    // Smooth fade/slide-in for hero and blog cards
    // Only run fade-in animation on mount
    useEffect(() => {
        let ranOnce = false;
        if (!ranOnce) {
            ranOnce = true;
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
        }
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
            {/* Hero Section with subtle 3D glass card */}
            <section ref={heroRef} className="w-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{minHeight:'420px'}}>
                <ThreeHero className="absolute left-8 top-8 md:left-16 md:top-10" width={180} height={180} />
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
