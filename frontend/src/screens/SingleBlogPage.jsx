import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const { id } = useParams();

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

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!blog) {
        return <div className="text-center">Blog not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="container px-4 py-8 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800 max-w-7xl"
                >
                    <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">{blog.title}</h1>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        By {blog.author.firstName} {blog.author.lastName}
                    </p>
                    <div className="mb-8 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                    <div className="flex items-center">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLike}
                            className="flex items-center px-4 py-2 mr-4 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                        >
                            <i className="mr-2 ri-heart-fill"></i> {blog.likes.length}
                        </motion.button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 mx-auto mt-8 bg-white rounded-lg shadow-lg dark:bg-gray-800 max-w-7xl"
                >
                    <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Comments</h2>
                    <form onSubmit={handleComment}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-24 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            placeholder="Add a comment..."
                            required
                        ></textarea>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="px-4 py-2 mt-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                        >
                            Post Comment
                        </motion.button>
                    </form>
                    <div className="mt-8">
                        {blog.comments.map((comment) => (
                            <div key={comment._id} className="p-4 mb-4 bg-gray-200 rounded-lg dark:bg-gray-700">
                                <p className="mb-2 text-gray-800 dark:text-white">
                                    <strong>{comment.user.firstName} {comment.user.lastName}</strong>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SingleBlogPage;
