import { useEffect, useState } from 'react';
import { BlogThemeProvider } from '../context/blogTheme.context';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import MaterialBlogCard from '../components/MaterialBlogCard';
import useDarkMode from '../hooks/useDarkMode';


const BlogsContent = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useDarkMode('blog_dark_mode', false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('blog_dark_mode', darkMode);
        }
    }, [darkMode]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                setBlogs(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching blogs:', error);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Material UI Hero Section */}
            <section className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{ minHeight: '340px' }}>
                {/* Dark mode switch button */}
                <button
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="absolute top-6 right-6 md:top-8 md:right-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
                    onClick={() => setDarkMode((d) => !d)}
                >
                    {darkMode ? (
                        <i className="ri-sun-line text-2xl text-yellow-400" />
                    ) : (
                        <i className="ri-moon-line text-2xl text-blue-700" />
                    )}
                </button>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-5xl font-bold mb-2 text-blue-800 dark:text-blue-200 tracking-tight">Discover Blogs</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-xl">Explore the latest posts, insights, and stories from our vibrant community. Stay inspired and informed!</p>
                    <Link to="/blogs/create">
                        <button className="mt-2 px-7 py-3 font-semibold text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 flex items-center gap-2">
                            <i className="ri-add-line text-xl"></i> Create New Post
                        </button>
                    </Link>
                </div>
            </section>
            {/* Blog Cards Grid */}
            <section className="w-full max-w-7xl mx-auto px-4 py-14">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                        <div className="text-lg font-medium text-blue-700 dark:text-blue-200">Loading blogs...</div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <i className="ri-file-list-3-line text-5xl text-blue-200 dark:text-gray-700 mb-3"></i>
                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-300">No blog posts found</div>
                        <div className="text-gray-400 dark:text-gray-500 mt-1">Be the first to create a new post!</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
                        {blogs.map((blog) => (
                            <MaterialBlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const Blogs = () => (
    <BlogThemeProvider>
        <BlogsContent />
    </BlogThemeProvider>
);

export default Blogs;
