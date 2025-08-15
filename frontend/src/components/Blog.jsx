import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/blogs');
                if (Array.isArray(response.data)) {
                    setBlogs(response.data.slice(0, 3));
                }
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
            navigate('/login', { state: { from: `/blogs/${blogId}` } });
        }
    };

    return (
        <section className="py-20 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto">
                <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">From Our Blog</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {Array.isArray(blogs) && blogs.map((blog, index) => (
                        <div
                            key={index}
                            className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-700"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            <div className="p-6">
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{blog.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{blog.content.substring(0, 100)}...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
