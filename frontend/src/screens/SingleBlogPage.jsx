

import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import anime from 'animejs';
import ThreeHero from '../components/ThreeHero';


const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    const { id } = useParams();
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    // ...removed Three.js setup, now using <ThreeHero />

    // Smooth fade/slide-in for hero and content
    // Only run fade-in animation on mount
    useEffect(() => {
        let ranOnce = false;
        if (!ranOnce) {
            ranOnce = true;
            if (heroRef.current) {
                anime({
                    targets: heroRef.current,
                    opacity: [0, 1],
                    translateY: [40, 0],
                    duration: 900,
                    easing: 'easeOutExpo',
                });
            }
            if (contentRef.current) {
                anime({
                    targets: contentRef.current.querySelectorAll('.prose > *'),
                    opacity: [0, 1],
                    translateY: [40, 0],
                    delay: anime.stagger(120),
                    duration: 800,
                    easing: 'easeOutExpo',
                });
            }
        }
    }, []);


    // Fetch blog data
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/blogs/${id}`);
                setBlog(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);




    const handleLike = async () => {
        try {
            const response = await axios.post(`/api/blogs/like/${id}`);
            setBlog(response.data);
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/blogs/comment/${id}`, { text: comment });
            setBlog(response.data);
            setComment('');
        } catch (error) {
            console.error('Error commenting on blog:', error);
        }
    };

    const renderContent = (content) => {
        try {
            const blocks = JSON.parse(content);
            return blocks.map(block => {
                if (block.type === 'text') return <p key={block.id} className="my-4 text-lg leading-relaxed">{block.content}</p>;
                if (block.type === 'image') return <img key={block.id} src={block.content} alt="blog content" className="my-8 rounded-lg shadow-lg" />;
                if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="blog video" className="my-8 w-full aspect-video rounded-lg" />;
                if (block.type === 'code') return <pre key={block.id}><code className="language-javascript bg-gray-900 text-white p-4 rounded-lg block overflow-x-auto">{block.content}</code></pre>;
                if (block.type === 'quote') return <blockquote key={block.id} className="my-8 p-4 border-l-4 border-blue-400 bg-gray-800 italic">{block.content}</blockquote>;
                return null;
            });
        } catch {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-3xl animate-pulse">Loading...</div>;
    }

    if (!blog) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-3xl">Blog not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Hero Section with subtle 3D glass card */}
            <section ref={heroRef} className="w-full flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" style={{minHeight:'420px'}}>
                <ThreeHero className="absolute left-8 top-8 md:left-16 md:top-10" width={180} height={180} />
                <h1 className="relative z-10 text-3xl md:text-4xl font-bold mb-2 text-center text-blue-700 dark:text-blue-300">{blog.title}</h1>
                <p className="relative z-10 text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2 text-center">By {blog.author.firstName} {blog.author.lastName}</p>
            </section>
            {/* Blog Content */}
            <main ref={contentRef} className="container px-4 py-8 mx-auto">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:p-10 mt-8">
                    <div className="prose prose-blue dark:prose-invert max-w-none text-lg leading-relaxed">
                        {renderContent(blog.content)}
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between mt-10 border-t border-gray-200 dark:border-gray-700 pt-6 gap-6">
                        <button
                            onClick={handleLike}
                            className="like-btn flex items-center gap-2 px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-all duration-200 text-base"
                        >
                            <i className="ri-heart-fill text-xl"></i> {blog.likes.length} <span className="hidden md:inline">Likes</span>
                        </button>
                        <div className="flex gap-4">
                            <a href={`https://twitter.com/intent/tweet?text=${blog.title}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-400 transition-colors duration-200"><i className="ri-twitter-fill"></i></a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-600 transition-colors duration-200"><i className="ri-facebook-box-fill"></i></a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-500 transition-colors duration-200"><i className="ri-linkedin-box-fill"></i></a>
                        </div>
                    </div>
                </div>
            </main>
            {/* Comments Section */}
            <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container px-4 mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Comments</h2>
                        <form onSubmit={handleComment} className="mb-8">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Join the discussion..."
                                required
                            ></textarea>
                            <button type="submit" className="px-6 py-2 mt-3 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-all duration-200">Post Comment</button>
                        </form>
                        <div className="space-y-6">
                            {blog.comments.map((comment) => {
                                const user = comment.user || {};
                                const firstName = user.firstName || '';
                                const lastName = user.lastName || '';
                                const avatar = firstName && typeof firstName === 'string' ? firstName[0] : '?';
                                return (
                                    <div key={comment._id} className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow">
                                            {avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base text-blue-700 dark:text-blue-200">{firstName} {lastName}</p>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            {/* Related Posts Section (placeholder) */}
            <section className="py-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="container px-4 mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Related Posts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow p-4">
                                    <h3 className="text-lg font-bold mb-1 text-blue-700 dark:text-blue-200">Related Post {i}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">This is a placeholder for a related blog post.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SingleBlogPage;
