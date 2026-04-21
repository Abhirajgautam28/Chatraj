import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';
import { logger } from '../utils/logger';
import CommentSection from '../components/CommentSection';
import useDarkMode from '../hooks/useDarkMode';
import ThreeHero from '../components/ThreeHero';

const SingleBlogPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isDarkMode, setIsDarkMode] = useDarkMode('blog_dark_mode', false);

    const fetchBlog = useCallback(async () => {
        try {
            const response = await axios.get(`/api/blogs/${id}`);
            setBlog(response.data);
        } catch (error) {
            logger.error('Error fetching blog:', error);
            showToast('Blog not found', 'error');
            navigate('/blogs');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`/api/blogs/${id}/like`);
            setBlog(prev => ({ ...prev, likes: response.data.likes }));
            showToast(response.data.likes.length > (blog?.likes?.length || 0) ? 'Blog liked!' : 'Like removed', 'success');
        } catch (error) {
            showToast('Login to like blogs', 'warning');
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await axios.post(`/api/blogs/${id}/comment`, { text: newComment });
            setBlog(response.data);
            setNewComment('');
            showToast('Comment posted!', 'success');
        } catch (error) {
            showToast('Failed to post comment', 'error');
        }
    };

    const blogContent = useMemo(() => {
        if (!blog) return null;
        try {
            const parsed = JSON.parse(blog.content);
            if (Array.isArray(parsed)) {
                return parsed.map((block, i) => (
                    <div key={i} className="mb-6">
                        {block.type === 'heading' && <h2 className="text-2xl font-bold mb-3">{block.content}</h2>}
                        {block.type === 'paragraph' && <p className="leading-relaxed mb-4">{block.content}</p>}
                        {block.type === 'code' && (
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto mb-4 font-mono text-sm">
                                <code>{block.content}</code>
                            </pre>
                        )}
                    </div>
                ));
            }
        } catch {
            return <p className="whitespace-pre-wrap leading-relaxed">{blog.content}</p>;
        }
    }, [blog]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!blog) return null;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className="fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition-all"
                >
                    {isDarkMode ? <i className="ri-sun-line text-xl text-yellow-400" /> : <i className="ri-moon-line text-xl text-blue-600" />}
                </button>
            </header>

            <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900">
                <ThreeHero className="absolute opacity-30" width={300} height={300} />
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">{blog.title}</h1>
                    <div className="flex items-center justify-center gap-4 text-blue-100 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="ri-user-line" />
                            </div>
                            {blog.author?.firstName} {blog.author?.lastName}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <i className="ri-calendar-line" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <article className={`prose prose-lg dark:prose-invert max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {blogContent}
                </article>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                            blog.likes?.length > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                        <i className={`ri-heart-${blog.likes?.length > 0 ? 'fill' : 'line'} text-xl`} />
                        <span className="font-bold">{blog.likes?.length || 0} Likes</span>
                    </button>

                    <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                            <i className="ri-share-forward-line" />
                        </button>
                    </div>
                </div>

                <CommentSection
                    comments={blog.comments || []}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onCommentSubmit={handleCommentSubmit}
                    isDarkMode={isDarkMode}
                />
            </main>
        </div>
    );
};

export default SingleBlogPage;
