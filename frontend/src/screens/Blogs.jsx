import { useEffect, useState, useRef } from 'react';
import anime from 'animejs';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

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
            anime({
                targets: '.blog-card',
                opacity: [0, 1],
                translateY: [50, 0],
                delay: anime.stagger(100),
                easing: 'easeOutExpo'
            });
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div ref={containerRef} className="container px-4 py-8 mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">The Blog</h1>
                    <p className="text-lg text-gray-400">
                        Explore the latest stories and insights from our community.
                    </p>
                </div>
                <div className="flex justify-between items-center mb-8">
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
                    <div className="column-1 md:column-2 lg:column-3 gap-8">
                        {blogs.map((blog) => (
                            <div
                                key={blog._id}
                                className="blog-card bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 mb-8 break-inside-avoid"
                            >
                                <div className="p-6">
                                    <h2 className="mb-2 text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-300">
                                        <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                                    </h2>
                                    <p className="mb-4 text-gray-400">
                                        By {blog.author.firstName} {blog.author.lastName}
                                    </p>
                                    <p className="mb-6 text-gray-300">
                                        {blog.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center justify-between text-gray-400">
                                        <Link
                                            to={`/blogs/${blog._id}`}
                                            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300"
                                        >
                                            Read More &rarr;
                                        </Link>
                                        <div className="flex items-center">
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
    );
};

export default Blogs;
