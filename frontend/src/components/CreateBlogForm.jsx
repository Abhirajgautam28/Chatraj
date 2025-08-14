import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBlogForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [topic, setTopic] = useState('');
    const navigate = useNavigate();

    const handleContentChange = (e) => {
        const text = e.target.value;
        setContent(text);
        if (text.endsWith('@Chatraj')) {
            const newTopic = text.substring(0, text.length - 8).trim();
            setTopic(newTopic);
        }
    };

    const handleGenerateContent = async () => {
        try {
            const response = await axios.post('/api/blogs/generate', { topic });
            setContent(response.data.content);
        } catch (error) {
            console.error('Error generating blog content:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/blogs', { title, content });
            navigate('/blogs');
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="container px-4 py-8 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Create a New Blog</h1>
                </motion.div>
                <motion.form
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="p-8 mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800 max-w-7xl"
                >
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="title">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="content">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={handleContentChange}
                            className="w-full h-64 px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            required
                        />
                        {topic && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGenerateContent}
                                className="px-4 py-2 mt-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                            >
                                Generate with @Chatraj
                            </motion.button>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                        >
                            Publish
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default CreateBlogForm;
