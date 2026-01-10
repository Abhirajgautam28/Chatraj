
import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';

const ItemType = 'BLOCK';

const inputBaseClass = "w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2";
const Block = ({ id, index, type, content, moveBlock, updateContent, deleteBlock }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemType,
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveBlock(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-start gap-3 relative">
            <span className="cursor-move text-gray-400 mr-2"><i className="ri-drag-move-2-line"></i></span>
            {type === 'text' && (
                <textarea
                    className={`${inputBaseClass} resize-none focus:ring-blue-400`}
                    value={content}
                    onChange={e => updateContent(id, e.target.value)}
                    placeholder="Write text..."
                    rows={3}
                />
            )}
            {type === 'image' && (
                <input
                    className={`${inputBaseClass} focus:ring-purple-400`}
                    value={content}
                    onChange={e => updateContent(id, e.target.value)}
                    placeholder="Paste image URL..."
                />
            )}
            {type === 'video' && (
                <input
                    className={`${inputBaseClass} focus:ring-red-400`}
                    value={content}
                    onChange={e => updateContent(id, e.target.value)}
                    placeholder="Paste YouTube video URL..."
                />
            )}
            {type === 'code' && (
                <textarea
                    className={`${inputBaseClass} bg-gray-900 text-white font-mono resize-none focus:ring-gray-400`}
                    value={content}
                    onChange={e => updateContent(id, e.target.value)}
                    placeholder="Paste code..."
                    rows={4}
                />
            )}
            {type === 'quote' && (
                <textarea
                    className={`${inputBaseClass} bg-yellow-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 italic resize-none focus:ring-yellow-400`}
                    value={content}
                    onChange={e => updateContent(id, e.target.value)}
                    placeholder="Write a quote..."
                    rows={2}
                />
            )}
            <button type="button" onClick={() => deleteBlock(id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><i className="ri-delete-bin-6-line"></i></button>
        </div>
    );
};

import { useState, useCallback } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import { BlogThemeProvider } from '../context/blogTheme.context';
//
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'remixicon/fonts/remixicon.css';
//


const getYouTubeEmbedUrl = (urlString) => {
    if (!urlString) return '';
    try {
        const url = new URL(urlString);
        let videoId = '';
        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
            if (url.pathname === '/watch' && url.searchParams.has('v')) {
                videoId = url.searchParams.get('v');
            } else if (url.pathname.startsWith('/embed/')) {
                videoId = url.pathname.split('/embed/')[1].split(/[/?]/)[0];
            } else if (url.pathname.startsWith('/v/')) {
                videoId = url.pathname.split('/v/')[1].split(/[/?]/)[0];
            }
        }
        if (!videoId) {
            const match = urlString.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
            if (match && match[1]) {
                videoId = match[1];
            }
        }
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch { }
    return '';
};

// Validate that a URL is safe. Allow http/https absolute URLs and
// same-origin relative paths like `/uploads/foo.jpg` or `images/foo.jpg`.
const isSafeUrl = (urlString) => {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
        const url = new URL(urlString);
        const protocol = url.protocol.toLowerCase();
        return protocol === 'http:' || protocol === 'https:';
    } catch (e) {
        // If URL constructor fails, this may be a relative URL. Allow
        // same-origin relative paths (starting with '/') or simple
        // relative paths without a protocol (no ':' char) and no spaces.
        // Explicitly disallow path-traversal patterns like "../", "/../" or "..\".
        if (urlString.startsWith('//')) return false; // protocol-relative URLs are disallowed

        // Reject extremely long inputs early to avoid DoS via huge attacker-controlled strings
        if (urlString.length > 2048) return false;

        const traversalRe = /(^|[\/\\])\.\.([\/\\]|$)/;

        // Attempt iterative percent-decoding up to a small limit (handles %252e%252e -> %2e%2e -> ..)
        let decoded = urlString;
        const maxDecodes = 3;
        for (let i = 0; i < maxDecodes; i++) {
            try {
                const next = decodeURIComponent(decoded);
                if (next === decoded) break;
                decoded = next;
                if (decoded.length > 4096) return false; // defensive size cap after decoding
            } catch (_) {
                break; // stop decoding on malformed sequences
            }
        }

        // Validate decoded value for traversal, colon, whitespace, and allowed chars.
        if (traversalRe.test(decoded)) return false;
        if (decoded.includes(':')) return false; // disallow strings containing a colon
        if (/\s/.test(decoded)) return false;
        if (!(decoded.startsWith('/') || /^[A-Za-z0-9_./~-]+$/.test(decoded))) return false;

        return true;
    }
};

const DarkModeToggle = ({ darkMode, setDarkMode }) => (
    <button
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
        onClick={() => setDarkMode((d) => !d)}
    >
        {darkMode ? (
            <i className="ri-sun-line text-2xl text-yellow-400" />
        ) : (
            <i className="ri-moon-line text-2xl text-blue-700" />
        )}
    </button>
);

const BlockList = ({ blocks, moveBlock, updateContent, deleteBlock }) => (
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
);

const LivePreview = ({ title, blocks }) => (
    <div className="glass-card p-8 md:p-10 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-400/30 via-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Live Preview</h2>
        <div className="prose prose-blue dark:prose-invert max-w-none">
            <h1 className="text-3xl font-extrabold mb-4 text-blue-700 dark:text-blue-300 drop-shadow">{title}</h1>
            {blocks.map(block => {
                if (block.type === 'text') return <p key={block.id} className="text-lg leading-relaxed mb-3">{block.content}</p>;
                if (block.type === 'image') {
                    const safeSrc = isSafeUrl(block.content) ? block.content : null;
                    if (!safeSrc) return <div key={block.id} className="w-full rounded-xl shadow mb-3 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 text-center">Invalid or unsupported image URL</div>;
                    return <img key={block.id} src={safeSrc} alt="preview" className="rounded-xl shadow mb-3" />;
                }
                if (block.type === 'video') {
                    const embedUrl = getYouTubeEmbedUrl(block.content);
                    // ensure embedUrl is https and safe
                    if (!embedUrl || !embedUrl.startsWith('https://')) {
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
);

const CreateBlogFormContent = () => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ id: 1, type: 'text', content: '' }]);
    const [darkMode, setDarkMode] = useDarkMode('create_blog_dark_mode', false);
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
        if (!title.trim()) {
            alert('Blog title cannot be empty.');
            return;
        }
        const content = JSON.stringify(blocks);
        try {
            await axios.post('/api/blogs', { title, content });
            navigate('/blogs');
        } catch (error) {
            console.error('Error creating blog:', error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col items-center justify-center py-10 px-2">
                <div className="w-full max-w-3xl mx-auto relative">
                    {/* Dark mode switch button */}
                    <button
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:shadow-md transition-all duration-200 flex items-center justify-center"
                        onClick={() => setDarkMode((d) => !d)}
                    >
                        {darkMode ? (
                            <i className="ri-sun-line text-2xl text-yellow-400" />
                        ) : (
                            <i className="ri-moon-line text-2xl text-blue-700" />
                        )}
                    </button>
                    <h1 className="text-4xl font-bold mb-8 text-center text-blue-700 dark:text-blue-200">Create a New Blog Post</h1>
                    <form onSubmit={handleSubmit} className="mb-10">
                        <div className="mb-8">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-4 text-2xl font-semibold bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                                placeholder="Blog Title"
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
                        <div className="flex flex-wrap gap-3 mb-8 justify-center">
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
                    <LivePreview title={title} blocks={blocks} />
                </div>
            </div>
        </DndProvider>
    );
};

const CreateBlogForm = (props) => (
    <BlogThemeProvider>
        <CreateBlogFormContent {...props} />
    </BlogThemeProvider>
);

export default CreateBlogForm;
