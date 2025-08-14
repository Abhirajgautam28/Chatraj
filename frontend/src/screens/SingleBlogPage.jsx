import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { useParams, Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [progress, setProgress] = useState(0);
    const { id } = useParams();
    const contentRef = useRef(null);

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

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const { top, height } = contentRef.current.getBoundingClientRect();
                const scrollableHeight = height - window.innerHeight;
                const scrolled = Math.max(0, -top);
                const currentProgress = Math.min(100, (scrolled / scrollableHeight) * 100);
                setProgress(currentProgress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [blog]);

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
        } catch (error) {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    };

    if (loading) {
        return <div className="text-center text-white text-2xl">Loading...</div>;
    }

    if (!blog) {
        return <div className="text-center text-white text-2xl">Blog not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-700 z-50">
                <div className="h-full bg-gradient-to-r from-blue-400 to-teal-400" style={{ width: `${progress}%` }}></div>
            </div>
            <header className="relative h-96">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container px-4 py-8 mx-auto h-full flex flex-col justify-end">
                    <h1 className="text-5xl font-extrabold mb-2">{blog.title}</h1>
                    <p className="text-lg text-gray-400">
                        By {blog.author.firstName} {blog.author.lastName}
                    </p>
                </div>
            </header>
            <div className="container px-4 py-8 mx-auto" ref={contentRef}>
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert max-w-none text-lg leading-relaxed">
                        {renderContent(blog.content)}
                    </div>
                    <div className="flex items-center justify-between mt-12 border-t border-gray-700 pt-8">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                        >
                            <i className="ri-heart-fill"></i> {blog.likes.length} Likes
                        </button>
                        <div className="flex gap-4">
                            <a href={`https://twitter.com/intent/tweet?text=${blog.title}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-400"><i className="ri-twitter-fill"></i></a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-600"><i className="ri-facebook-box-fill"></i></a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`} target="_blank" rel="noreferrer" className="text-2xl hover:text-blue-500"><i className="ri-linkedin-box-fill"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-16 bg-gray-800">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Comments</h2>
                        <form onSubmit={handleComment} className="mb-12">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-32 p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Join the discussion..."
                                required
                            ></textarea>
                            <button type="submit" className="px-6 py-3 mt-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">Post Comment</button>
                        </form>
                        <div className="space-y-8">
                            {blog.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold">{comment.user.firstName[0]}</div>
                                    <div>
                                        <p className="font-bold">{comment.user.firstName} {comment.user.lastName}</p>
                                        <p className="text-gray-400">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleBlogPage;
