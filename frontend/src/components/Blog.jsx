
import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                if (Array.isArray(response.data)) {
                    setBlogs(response.data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (blogs.length > 0) {
            anime({
                targets: '.blog-preview-card',
                opacity: [0, 1],
                translateY: [60, 0],
                delay: anime.stagger(120),
                duration: 900,
                easing: 'easeOutExpo',
            });
        }
    }, [blogs]);

    const handleBlogClick = (blogId) => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(`/blogs/${blogId}`);
        } else {
            navigate('/login', { state: { from: `/blogs/${blogId}` } });
        }
    };

    return (
        <section className="py-20 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
            <div className="max-w-6xl mx-auto">
                <h2 className="mb-12 text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-300 dark:to-teal-200">From Our Blog</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {Array.isArray(blogs) && blogs.map((blog, index) => (
                        <div
                            key={index}
                            className="blog-preview-card overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900 rounded-3xl shadow-2xl group transition-transform duration-300 cursor-pointer hover:shadow-blue-500/30"
                            onClick={() => handleBlogClick(blog._id)}
                            onMouseEnter={e => anime({ targets: e.currentTarget, scale: 1.04, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)', duration: 350, easing: 'easeOutExpo' })}
                            onMouseLeave={e => anime({ targets: e.currentTarget, scale: 1, boxShadow: '0 4px 16px 0 rgba(59,130,246,0.13)', duration: 350, easing: 'easeOutExpo' })}
                        >
                            <div className="p-8 flex flex-col gap-4">
                                <p className="mb-2 text-sm text-blue-200">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                <h3 className="mb-2 text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors duration-300">{blog.title}</h3>
                                <p className="text-gray-300 text-lg">{blog.content.substring(0, 100)}...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
