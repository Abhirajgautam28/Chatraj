
import React, { useState, useCallback, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useDarkMode from '../hooks/useDarkMode';
import { BlogThemeProvider } from '../context/blogTheme.context';
import { useToast } from '../context/toast.context';
import { useApi } from '../hooks/useApi';
import { isSafeUrl, getYouTubeEmbedUrl } from '../utils/url.utils';

const ItemType = 'BLOCK';
const inputBaseClass = "w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2";

const Block = ({ id, index, type, content, moveBlock, updateContent, deleteBlock }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemType,
        hover(item) {
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
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-start gap-3 relative border border-gray-100 dark:border-gray-700">
            <span className="cursor-move text-gray-400 mr-2"><i className="ri-drag-move-2-line"></i></span>
            {type === 'text' && <textarea className={`${inputBaseClass} resize-none focus:ring-blue-400`} value={content} onChange={e => updateContent(id, e.target.value)} placeholder="Write text..." rows={3} />}
            {type === 'image' && <input className={`${inputBaseClass} focus:ring-purple-400`} value={content} onChange={e => updateContent(id, e.target.value)} placeholder="Paste image URL..." />}
            {type === 'video' && <input className={`${inputBaseClass} focus:ring-red-400`} value={content} onChange={e => updateContent(id, e.target.value)} placeholder="Paste YouTube video URL..." />}
            {type === 'code' && <textarea className={`${inputBaseClass} bg-gray-900 text-white font-mono resize-none focus:ring-gray-400`} value={content} onChange={e => updateContent(id, e.target.value)} placeholder="Paste code..." rows={4} />}
            {type === 'quote' && <textarea className={`${inputBaseClass} bg-yellow-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 italic resize-none focus:ring-yellow-400`} value={content} onChange={e => updateContent(id, e.target.value)} placeholder="Write a quote..." rows={2} />}
            <button type="button" onClick={() => deleteBlock(id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"><i className="ri-delete-bin-6-line"></i></button>
        </div>
    );
};

Block.propTypes = {
    id: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    moveBlock: PropTypes.func.isRequired,
    updateContent: PropTypes.func.isRequired,
    deleteBlock: PropTypes.func.isRequired,
};

const LivePreview = ({ title, blocks }) => (
    <div className="p-8 md:p-10 bg-white/60 dark:bg-gray-800/60 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Live Preview</h2>
        <div className="prose prose-blue dark:prose-invert max-w-none">
            <h1 className="text-3xl font-extrabold mb-4 text-blue-700 dark:text-blue-300">{title || 'Untitled Blog'}</h1>
            {blocks.map(block => {
                if (block.type === 'text') return <p key={block.id} className="text-lg leading-relaxed mb-3">{block.content}</p>;
                if (block.type === 'image') {
                    const safeSrc = isSafeUrl(block.content) ? block.content : null;
                    if (!safeSrc) return <div key={block.id} className="w-full h-24 rounded-xl mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400 italic">Invalid image URL</div>;
                    return <img key={block.id} src={safeSrc} alt="preview" className="rounded-xl shadow-md mb-3" />;
                }
                if (block.type === 'video') {
                    const embedUrl = getYouTubeEmbedUrl(block.content);
                    if (!embedUrl) return <div key={block.id} className="w-full h-24 rounded-xl mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400 italic">Invalid video URL</div>;
                    return <iframe key={block.id} src={embedUrl} title="preview" className="w-full aspect-video rounded-xl shadow-md mb-3" allowFullScreen />;
                }
                if (block.type === 'code') return <pre key={block.id} className="bg-gray-900 text-green-400 rounded-xl p-4 mb-3 overflow-x-auto"><code>{block.content}</code></pre>;
                if (block.type === 'quote') return <blockquote key={block.id} className="border-l-4 border-blue-400 pl-4 italic text-lg text-blue-700 dark:text-blue-300 mb-3">{block.content}</blockquote>;
                return null;
            })}
        </div>
    </div>
);

LivePreview.propTypes = {
    title: PropTypes.string,
    blocks: PropTypes.array.isRequired,
};

const CreateBlogFormContent = () => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([{ id: 1, type: 'text', content: '' }]);
    const [darkMode, setDarkMode] = useDarkMode('create_blog_dark_mode', false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { request: createBlogRequest, loading } = useApi();

    const moveBlock = useCallback((dragIndex, hoverIndex) => {
        setBlocks((prev) => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(hoverIndex, 0, moved);
            return next;
        });
    }, []);

    const updateContent = (id, content) => setBlocks(p => p.map(b => b.id === id ? { ...b, content } : b));
    const addBlock = (type) => setBlocks(p => [...p, { id: Date.now(), type, content: '' }]);
    const deleteBlock = (id) => setBlocks(p => p.filter(b => b.id !== id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return showToast('Title required', 'warning');

        const { error } = await createBlogRequest({
            url: '/api/blogs',
            method: 'POST',
            data: { title, content: JSON.stringify(blocks) }
        }, { showSuccessToast: true, successMessage: 'Blog published!' });

        if (!error) navigate('/blogs');
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={`min-h-screen transition-colors duration-300 py-12 px-6 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">Create Blog</h1>
                        <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg transition-transform hover:scale-110">
                            {darkMode ? <i className="ri-sun-line text-yellow-400" /> : <i className="ri-moon-line text-blue-600" />}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 mb-16">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-5 text-3xl font-bold bg-white dark:bg-gray-800 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Epic Title Goes Here..."
                            required
                        />

                        <div className="space-y-4">
                            {blocks.map((block, i) => <Block key={block.id} index={i} {...block} moveBlock={moveBlock} updateContent={updateContent} deleteBlock={deleteBlock} />)}
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {['text', 'image', 'video', 'code', 'quote'].map(type => (
                                <button key={type} type="button" onClick={() => addBlock(type)} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-all font-semibold capitalize flex items-center gap-2">
                                    <i className={`ri-${type === 'text' ? 'text' : type === 'code' ? 'code-s-slash' : type === 'quote' ? 'double-quotes-l' : type}-line text-blue-500`}></i>
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50">
                                {loading ? 'Publishing...' : 'Publish Masterpiece'}
                            </button>
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
