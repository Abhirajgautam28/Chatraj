
import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Hero Section */}
            <section className="w-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center text-blue-700 dark:text-blue-300">Blog Posts</h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 text-center">Read the latest from our community</p>
                <Link to="/blogs/create">
                    <button className="mt-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-all duration-200">
                        <i className="ri-add-line mr-2"></i> Create New Post
                    </button>
                </Link>
            </section>
            {/* Blog Cards Grid */}
            <section className="container px-4 py-12 mx-auto">
                {loading ? (
                    <div className="text-center text-2xl font-semibold animate-pulse">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blogs;
