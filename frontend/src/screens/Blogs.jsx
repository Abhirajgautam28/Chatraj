import React, { useEffect, useCallback, useMemo } from 'react';
import 'remixicon/fonts/remixicon.css';
import MaterialBlogCard from '../components/MaterialBlogCard';
import useDarkMode from '../hooks/useDarkMode';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';

const Blogs = () => {
    const { request, loading, data: responseData } = useApi();
    const [darkMode, setDarkMode] = useDarkMode('blog_dark_mode', false);

    const blogs = useMemo(() => responseData?.blogs || [], [responseData]);
    const pagination = useMemo(() => responseData?.pagination || { page: 1, pages: 1 }, [responseData]);

    const fetchBlogs = useCallback(async (page = 1) => {
        await request({
            url: `/api/blogs?page=${page}&limit=9`,
            method: 'GET'
        });
    }, [request]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('blog_dark_mode', darkMode);
    }, [darkMode]);

    const memoizedBlogs = useMemo(() => blogs.map(blog => (
        <MaterialBlogCard key={blog._id} blog={blog} />
    )), [blogs]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <section className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{ minHeight: '340px' }}>
                <button
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="absolute top-6 right-6 md:top-8 md:right-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? <i className="ri-sun-line text-2xl text-yellow-400" /> : <i className="ri-moon-line text-2xl text-blue-700" />}
                </button>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                    <h1 className="text-5xl font-bold mb-2 text-blue-800 dark:text-blue-200 tracking-tight">Discover Blogs</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-xl">Explore the latest posts, insights, and stories from our vibrant community.</p>
                    <Link to="/blogs/create">
                        <button className="px-7 py-3 font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 flex items-center gap-2">
                            <i className="ri-add-line text-xl"></i> Create New Post
                        </button>
                    </Link>
                </div>
            </section>

            <section className="w-full max-w-7xl mx-auto px-4 py-14">
                {loading && blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 rounded-full animate-spin mb-4"></div>
                        <div className="text-lg font-medium text-blue-700 dark:text-blue-200">Loading blogs...</div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <i className="ri-file-list-3-line text-5xl text-blue-200 dark:text-gray-700 mb-3"></i>
                        <div className="text-xl font-semibold text-gray-500 dark:text-gray-300">No blog posts found</div>
                        <Link to="/blogs/create" className="text-blue-600 mt-2 hover:underline">Be the first to create a post!</Link>
                    </div>
                ) : (
                    <>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            {memoizedBlogs}
                        </div>
                        {pagination.pages > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => fetchBlogs(p)}
                                        className={`px-4 py-2 rounded-lg transition-all ${pagination.page === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Blogs;
