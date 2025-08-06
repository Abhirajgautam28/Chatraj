import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get('/api/blogs');
                setBlogs(res.data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    const handleBlogClick = (blogId) => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(`/blogs/${blogId}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <section className="py-20 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">From Our Blog</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {blogs.map((blog, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-700"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            <div className="p-6">
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{blog.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{blog.content.substring(0, 100)}...</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
