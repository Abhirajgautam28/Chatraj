import { useState, useCallback } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'remixicon/fonts/remixicon.css';

const ItemTypes = {
    BLOCK: 'block',
};

const Block = ({ id, type, content, index, moveBlock, updateContent }) => {
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
            className="p-4 mb-4 bg-gray-700 rounded-lg shadow-md flex items-center"
        >
            <i className="ri-drag-move-2-line mr-4 cursor-move text-gray-400"></i>
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
        </div>
    );
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

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="container px-4 py-8 mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Create Your Masterpiece</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 mx-auto bg-gray-800 rounded-lg shadow-lg max-w-4xl">
                        <div className="mb-8">
                            <label className="block mb-2 text-2xl font-bold text-gray-300" htmlFor="title">
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
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => addBlock('text')}
                                className="px-6 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <i className="ri-text mr-2"></i> Add Text Block
                            </button>
                            <button
                                type="button"
                                onClick={() => addBlock('image')}
                                className="px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
                            >
                                <i className="ri-image-add-line mr-2"></i> Add Image Block
                            </button>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                className="px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
                            >
                                Publish Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DndProvider>
    );
};

export default CreateBlogForm;
