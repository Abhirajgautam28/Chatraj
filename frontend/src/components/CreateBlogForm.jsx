import { useState, useCallback, useRef, useEffect } from 'react';
import { BlogThemeProvider } from '../context/blogTheme.context';
import useBlogTheme from '../context/useBlogTheme';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import anime from 'animejs';
import 'remixicon/fonts/remixicon.css';

const ItemTypes = {
    BLOCK: 'block',
};

import PropTypes from 'prop-types';

const Block = ({ id, type, content, index, moveBlock, updateContent, deleteBlock }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemTypes.BLOCK,
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            moveBlock(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.BLOCK,
        item: () => ({ id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    return (
        <div
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1, boxShadow: isDragging ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)' : '0 4px 24px 0 rgba(31, 38, 135, 0.10)' }}
            className="relative p-4 mb-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center group transition-all duration-300"
        >
            <button
                type="button"
                title="Drag to reorder"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 shadow hover:scale-110 transition"
                style={{ cursor: 'grab' }}
            >
                <i className="ri-drag-move-2-line text-xl text-blue-400"></i>
            </button>
            <div className="flex-grow ml-12">
                {type === 'text' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-24 p-3 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner transition"
                        placeholder="Start writing your story..."
                    />
                )}
                {type === 'image' && (
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full p-3 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-inner transition"
                        placeholder="Enter image URL"
                    />
                )}
                {type === 'video' && (
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full p-3 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner transition"
                        placeholder="Enter video URL (e.g., YouTube)"
                    />
                )}
                {type === 'code' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-48 p-3 bg-gray-900/80 text-white rounded-xl font-mono border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-inner transition"
                        placeholder="Write your code here..."
                    />
                )}
                {type === 'quote' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-20 p-3 bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white rounded-xl italic border-l-4 border-blue-400 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner transition"
                        placeholder="Enter a quote..."
                    />
                )}
            </div>
            <button
                type="button"
                onClick={() => deleteBlock(id)}
                title="Delete block"
                className="ml-4 p-2 rounded-full bg-red-50 dark:bg-red-900/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-800/80 shadow transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
            >
                <i className="ri-delete-bin-line text-lg"></i>
            </button>
        </div>
    );
};

Block.propTypes = {
    id: PropTypes.any.isRequired,
    type: PropTypes.string.isRequired,
    content: PropTypes.any,
    index: PropTypes.number.isRequired,
    moveBlock: PropTypes.func.isRequired,
    updateContent: PropTypes.func.isRequired,
    deleteBlock: PropTypes.func.isRequired,
};

const CreateBlogFormContent = () => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ id: 1, type: 'text', content: '' }]);
    const navigate = useNavigate();

    const moveBlock = useCallback((dragIndex, hoverIndex) => {
        setBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            const [draggedBlock] = newBlocks.splice(dragIndex, 1);
            newBlocks.splice(hoverIndex, 0, draggedBlock);
            return newBlocks;
        });
    }, []);

    const updateContent = (id, newContent) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === id ? { ...block, content: newContent } : block
            )
        );
    };

    const addBlock = (type) => {
        setBlocks((prevBlocks) => [
            ...prevBlocks,
            { id: Date.now(), type, content: '' },
        ]);
    };

    const deleteBlock = (id) => {
        setBlocks((prevBlocks) => prevBlocks.filter(block => block.id !== id));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = JSON.stringify(blocks);
        try {
            await axios.post('/api/blogs', { title, content });
            navigate('/blogs');
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

        const CreateBlogForm = (props) => (
            <BlogThemeProvider>
                <CreateBlogFormContent {...props} />
            </BlogThemeProvider>
        );

        export default CreateBlogForm;
                                    required
                                />
                            </div>
                            <div className="mb-8">
                                {blocks.map((block, index) => (
                                    <Block
                                        key={block.id}
                                        index={index}
                                        id={block.id}
                                        type={block.type}
                                        content={block.content}
                                        moveBlock={moveBlock}
                                        updateContent={updateContent}
                                        deleteBlock={deleteBlock}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3 mb-8">
                                <button type="button" onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-500 rounded-xl shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"><i className="ri-text"></i>Text</button>
                                <button type="button" onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-purple-500 rounded-xl shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"><i className="ri-image-add-line"></i>Image</button>
                                <button type="button" onClick={() => addBlock('video')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-red-500 rounded-xl shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"><i className="ri-film-line"></i>Video</button>
                                <button type="button" onClick={() => addBlock('code')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-gray-700 rounded-xl shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"><i className="ri-code-s-slash-line"></i>Code</button>
                                <button type="button" onClick={() => addBlock('quote')} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-yellow-500 rounded-xl shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"><i className="ri-double-quotes-l"></i>Quote</button>
                            </div>
                            <div className="flex items-center justify-end">
                                <button type="submit" className="px-8 py-3 font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">Publish Post</button>
                            </div>
                        </form>
                        <div className="glass-card p-8 md:p-10 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-400/30 via-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Live Preview</h2>
                            <div className="prose prose-blue dark:prose-invert max-w-none">
                                <h1 className="text-3xl font-extrabold mb-4 text-blue-700 dark:text-blue-300 drop-shadow">{title}</h1>
                                {blocks.map(block => {
                                    if (block.type === 'text') return <p key={block.id} className="text-lg leading-relaxed mb-3">{block.content}</p>;
                                    if (block.type === 'image') return <img key={block.id} src={block.content} alt="preview" className="rounded-xl shadow mb-3" />;
                                    if (block.type === 'video') {
                                        // Robust YouTube embed logic
                                        const getYouTubeEmbedUrl = (urlString) => {
                                            if (!urlString) return '';
                                            // Enhanced YouTube URL parser to handle multiple formats
                                            // Accepts: https://www.youtube.com/watch?v=VIDEO_ID
                                            //          https://youtu.be/VIDEO_ID
                                            //          https://www.youtube.com/embed/VIDEO_ID
                                            //          URLs with extra parameters
                                            try {
                                                const url = new URL(urlString);
                                                let videoId = '';
                                                // Handle youtu.be short links
                                                if (url.hostname === 'youtu.be') {
                                                    videoId = url.pathname.slice(1);
                                                }
                                                // Handle youtube.com URLs
                                                else if (
                                                    url.hostname.includes('youtube.com')
                                                ) {
                                                    // /watch?v=VIDEO_ID
                                                    if (url.pathname === '/watch' && url.searchParams.has('v')) {
                                                        videoId = url.searchParams.get('v');
                                                    }
                                                    // /embed/VIDEO_ID
                                                    else if (url.pathname.startsWith('/embed/')) {
                                                        videoId = url.pathname.split('/embed/')[1].split(/[/?]/)[0];
                                                    }
                                                    // /v/VIDEO_ID
                                                    else if (url.pathname.startsWith('/v/')) {
                                                        videoId = url.pathname.split('/v/')[1].split(/[/?]/)[0];
                                                    }
                                                }
                                                // Fallback: Try to extract video ID from common patterns
                                                if (!videoId) {
                                                    const match = urlString.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
                                                    if (match && match[1]) {
                                                        videoId = match[1];
                                                    }
                                                }
                                                if (videoId) {
                                                    return `https://www.youtube.com/embed/${videoId}`;
                                                }
                                            } catch {
                                                // Not a valid URL
                                            }
                                            // Not a valid YouTube URL, return empty string to avoid broken iframe
                                            return '';
                                        };
                                        const embedUrl = getYouTubeEmbedUrl(block.content);
                                        if (!embedUrl) {
                                            return <div key={block.id} className="w-full aspect-video rounded-xl shadow mb-3 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 text-center">Invalid or unsupported video URL</div>;
                                        }
                                        return <iframe key={block.id} src={embedUrl} title="preview" className="w-full aspect-video rounded-xl shadow mb-3" allowFullScreen />;
                                    }
                                    if (block.type === 'code') return <pre key={block.id} className="bg-gray-900/90 text-white rounded-xl p-4 mb-3 overflow-x-auto"><code className="language-javascript">{block.content}</code></pre>;
                                    if (block.type === 'quote') return <blockquote key={block.id} className="border-l-4 border-blue-400 pl-4 italic text-lg text-blue-700 dark:text-blue-300 mb-3">{block.content}</blockquote>;
                                    return null;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default CreateBlogForm;
