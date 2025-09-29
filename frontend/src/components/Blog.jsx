import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTheme from '../context/useTheme';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';

function Blog({ user }) {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
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
        if (user) {
            navigate(`/blogs/${blogId}`);
        } else {
            navigate('/login', { state: { from: `/blogs/${blogId}` } });
        }
    };

    return (
        <div className={isDarkMode ? 'bg-gray-900 text-white transition-colors duration-300' : 'bg-white text-gray-900 transition-colors duration-300'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-preview-card">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col justify-between min-h-[260px]"
                            onClick={() => handleBlogClick(blog._id)}
                        >
                            <div className="p-6 flex flex-col gap-2 flex-grow">
                                <h2 className="mb-1 text-2xl font-bold text-blue-700 dark:text-blue-300 truncate">{blog.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">By {blog.author.firstName} {blog.author.lastName}</p>
                                <p className="text-gray-700 dark:text-gray-200 text-base line-clamp-3 flex-grow">
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(blog.content);
                                            if (Array.isArray(parsed)) {
                                                // Join all text content fields if array of objects
                                                return parsed.map(item => item.content).filter(Boolean).join(' ').substring(0, 150) + '...';
                                            }
                                            // If parsed is string, just show it
                                            if (typeof parsed === 'string') {
                                                return parsed.substring(0, 150) + '...';
                                            }
                                            // Fallback: show as string
                                            return blog.content.substring(0, 150) + '...';
                                        } catch {
                                            // Not JSON, show as plain text
                                            return blog.content.substring(0, 150) + '...';
                                        }
                                    })()}
                                </p>
                            </div>
                            <div className="flex items-center justify-between px-6 pb-4">
                                <span className="font-medium text-blue-600 dark:text-blue-400 text-base cursor-pointer">Read More &rarr;</span>
                                <div className="flex items-center text-base">
                                    <i className="mr-1 ri-heart-fill text-red-500"></i> {blog.likes.length}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

Blog.propTypes = {
    user: PropTypes.object,
};

export default Blog;


Blog.propTypes = {
    user: PropTypes.object,
};
