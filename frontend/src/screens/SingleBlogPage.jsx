import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/toast.context';
import CommentSection from '../components/CommentSection';
import useDarkMode from '../hooks/useDarkMode';
import ThreeHero from '../components/ThreeHero';
import { useApi } from '../hooks/useApi';

const SingleBlogPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isDarkMode, setIsDarkMode] = useDarkMode('blog_dark_mode', false);
    const [newComment, setNewComment] = useState('');

    const { request: fetchBlogRequest, loading, data: blog, setData: setBlog } = useApi();
    const { request: likeRequest } = useApi();
    const { request: commentRequest } = useApi();

    const fetchBlog = useCallback(async () => {
        const { error } = await fetchBlogRequest({
            url: `/api/blogs/${id}`,
            method: 'GET'
        });
        if (error) navigate('/blogs');
    }, [id, navigate, fetchBlogRequest]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    const handleLike = async () => {
        const { data, error } = await likeRequest({
            url: `/api/blogs/${id}/like`,
            method: 'POST'
        }, { showErrorToast: true });

        if (data) {
            const isLiked = data.likes.length > (blog?.likes?.length || 0);
            setBlog(prev => ({ ...prev, likes: data.likes }));
            showToast(isLiked ? 'Blog liked!' : 'Like removed', 'success');
        } else if (error) {
            showToast('Login to like blogs', 'warning');
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        const { data } = await commentRequest({
            url: `/api/blogs/${id}/comment`,
            method: 'POST',
            data: { text: newComment }
        }, { showSuccessToast: true, successMessage: 'Comment posted!' });

        if (data) {
            setBlog(data);
            setNewComment('');
        }
    };

    const blogContent = useMemo(() => {
        if (!blog) return null;
        try {
            const parsed = JSON.parse(blog.content);
            if (Array.isArray(parsed)) {
                return parsed.map((block, i) => {
                    const blockKey = block.id || i;
                    return (
                        <div key={blockKey} className="mb-8">
                            {(block.type === 'text' || block.type === 'paragraph') && (
                                <p className="leading-relaxed text-lg whitespace-pre-wrap">{block.content}</p>
                            )}
                            {block.type === 'heading' && (
                                <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                                    {block.content}
                                </h2>
                            )}
                            {block.type === 'image' && block.content && (
                                <figure className="my-8">
                                    <img
                                        src={block.content}
                                        alt=""
                                        className="w-full rounded-2xl shadow-lg border dark:border-gray-800"
                                    />
                                </figure>
                            )}
                            {block.type === 'video' && block.content && (
                                <div className="my-8 aspect-video rounded-2xl overflow-hidden shadow-lg border dark:border-gray-800">
                                    <iframe
                                        src={block.content.includes('youtube.com') || block.content.includes('youtu.be')
                                            ? `https://www.youtube.com/embed/${block.content.split('v=')[1] || block.content.split('/').pop()}`
                                            : block.content}
                                        title={`Video ${blockKey}`}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                            {block.type === 'code' && (
                                <pre className="bg-gray-950 text-blue-400 p-6 rounded-2xl overflow-x-auto my-6 font-mono text-sm shadow-inner border border-gray-800">
                                    <code>{block.content}</code>
                                </pre>
                            )}
                            {block.type === 'quote' && (
                                <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8 italic text-xl text-gray-700 dark:text-gray-300 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-xl">
                                    &ldquo;{block.content}&rdquo;
                                </blockquote>
                            )}
                        </div>
                    );
                });
            }
        } catch (err) {
            return <p className="whitespace-pre-wrap leading-relaxed">{blog.content}</p>;
        }
        return <p className="whitespace-pre-wrap leading-relaxed">{blog.content}</p>;
    }, [blog]);

    if (loading && !blog) return (
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
