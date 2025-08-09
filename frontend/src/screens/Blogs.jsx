import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="container px-4 py-8 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Our Blog</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Latest news and articles from our team
                    </p>
                </motion.div>
                <div className="flex justify-end mb-4">
                    <Link to="/blogs/create">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                        >
                            <i className="ri-add-line"></i> Create Blog
                        </motion.button>
                    </Link>
                </div>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800"
                            >
                                <div className="p-6">
                                    <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                                        <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                                    </h2>
                                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                                        By {blog.author.firstName} {blog.author.lastName}
                                    </p>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                                        {blog.content.substring(0, 100)}...
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/blogs/${blog._id}`}
                                            className="text-blue-500 hover:underline"
                                        >
                                            Read More
                                        </Link>
                                        <div className="flex items-center">
                                            <i className="mr-1 ri-heart-line"></i> {blog.likes.length}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
