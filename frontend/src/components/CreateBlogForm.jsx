
import { useState, useCallback, useRef, useEffect } from 'react';
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
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveBlock(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.BLOCK,
        item: () => ({ id, index }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{ opacity: isDragging ? 0 : 1 }}
            className="p-4 mb-4 bg-gray-700 rounded-lg shadow-md flex items-center group"
        >
            <i className="ri-drag-move-2-line mr-4 cursor-move text-gray-400"></i>
            <div className="flex-grow">
                {type === 'text' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-24 p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Start writing your story..."
                    />
                )}
                {type === 'image' && (
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter image URL"
                    />
                )}
                {type === 'video' && (
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter video URL (e.g., YouTube)"
                    />
                )}
                {type === 'code' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-48 p-2 bg-gray-900 text-white rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your code here..."
                    />
                )}
                {type === 'quote' && (
                    <textarea
                        value={content}
                        onChange={(e) => updateContent(id, e.target.value)}
                        className="w-full h-20 p-2 bg-gray-600 text-white rounded-md italic border-l-4 border-blue-400 pl-4"
                        placeholder="Enter a quote..."
                    />
                )}
            </div>
            <button
                type="button"
                onClick={() => deleteBlock(id)}
                className="ml-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <i className="ri-delete-bin-line"></i>
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

const CreateBlogForm = () => {
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

    // Animate entrance
    useEffect(() => {
        anime({
            targets: '.blog-form-hero',
            opacity: [0, 1],
            translateY: [80, 0],
            duration: 1200,
            easing: 'easeOutExpo',
        });
        anime({
            targets: '.blog-form-section',
            opacity: [0, 1],
            translateY: [60, 0],
            delay: anime.stagger(120),
            duration: 900,
            easing: 'easeOutExpo',
        });
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-blue-800 text-white overflow-x-hidden">
                <div className="container px-4 py-8 mx-auto">
                    <div className="text-center mb-12 blog-form-hero">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 animate__animated animate__fadeInDown">Create Your Masterpiece</h1>
                        <p className="text-xl text-blue-200 animate__animated animate__fadeInUp">Share your journey, code, and creativity with the world.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 blog-form-section">
                        <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-3xl shadow-2xl">
                            <div className="mb-8">
                                <label className="block mb-2 text-2xl font-bold text-blue-200" htmlFor="title">
                                    Blog Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 text-xl text-white bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                    placeholder="Your Awesome Title"
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

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button type="button" onClick={() => addBlock('text')} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"><i className="ri-text mr-2"></i> Add Text</button>
                                <button type="button" onClick={() => addBlock('image')} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"><i className="ri-image-add-line mr-2"></i> Add Image</button>
                                <button type="button" onClick={() => addBlock('video')} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"><i className="ri-film-line mr-2"></i> Add Video</button>
                                <button type="button" onClick={() => addBlock('code')} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105"><i className="ri-code-s-slash-line mr-2"></i> Add Code</button>
                                <button type="button" onClick={() => addBlock('quote')} className="px-6 py-3 font-bold text-white bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105"><i className="ri-double-quotes-l mr-2"></i> Add Quote</button>
                            </div>

                            <div className="flex items-center justify-end">
                                <button type="submit" className="px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">Publish Post</button>
                            </div>
                        </form>
                        <div className="p-8 bg-gray-800 rounded-3xl shadow-2xl">
                            <h2 className="text-3xl font-bold mb-4 text-blue-200">Live Preview</h2>
                            <div className="prose prose-invert max-w-none">
                                <h1>{title}</h1>
                                {blocks.map(block => {
                                    if (block.type === 'text') return <p key={block.id}>{block.content}</p>;
                                    if (block.type === 'image') return <img key={block.id} src={block.content} alt="preview" className="rounded-lg" />;
                                    if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="preview" className="w-full aspect-video rounded-lg" />;
                                    if (block.type === 'code') return <pre key={block.id}><code className="language-javascript">{block.content}</code></pre>;
                                    if (block.type === 'quote') return <blockquote key={block.id}>{block.content}</blockquote>;
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
