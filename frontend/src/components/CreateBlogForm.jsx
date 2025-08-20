import { useState, useCallback, useRef } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    TextField,
    Paper,
    IconButton,
} from '@mui/material';
import {
    DragHandle,
    Delete,
    TextFields,
    Image,
    Videocam,
    Code,
    FormatQuote,
} from '@mui/icons-material';

const ItemTypes = {
    BLOCK: 'block',
};

const Block = ({ id, type, content, index, moveBlock, updateContent, deleteBlock }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemTypes.BLOCK,
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
        type: ItemTypes.BLOCK,
        item: () => ({ id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));

    return (
        <Paper
            ref={ref}
            elevation={3}
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <IconButton sx={{ cursor: 'grab' }}>
                <DragHandle />
            </IconButton>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    variant="outlined"
                    value={content}
                    onChange={(e) => updateContent(id, e.target.value)}
                    placeholder={
                        type === 'text' ? 'Start writing your story...' :
                        type === 'image' ? 'Enter image URL' :
                        type === 'video' ? 'Enter video URL (e.g., YouTube)' :
                        type === 'code' ? 'Write your code here...' :
                        type === 'quote' ? 'Enter a quote...' : ''
                    }
                    rows={type === 'code' ? 6 : 3}
                />
            </Box>
            <IconButton onClick={() => deleteBlock(id)} color="error">
                <Delete />
            </IconButton>
        </Paper>
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

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        Create a New Blog Post
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" paragraph>
                        Share your journey, code, and creativity with the world.
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Blog Title"
                                    variant="outlined"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    sx={{ mb: 4 }}
                                />
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
                                <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                                    <Button startIcon={<TextFields />} onClick={() => addBlock('text')}>Text</Button>
                                    <Button startIcon={<Image />} onClick={() => addBlock('image')}>Image</Button>
                                    <Button startIcon={<Videocam />} onClick={() => addBlock('video')}>Video</Button>
                                    <Button startIcon={<Code />} onClick={() => addBlock('code')}>Code</Button>
                                    <Button startIcon={<FormatQuote />} onClick={() => addBlock('quote')}>Quote</Button>
                                </Box>
                                <Button type="submit" variant="contained" size="large">
                                    Publish Post
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 4 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    Live Preview
                                </Typography>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    {title}
                                </Typography>
                                {blocks.map(block => {
                                    if (block.type === 'text') return <Typography key={block.id} paragraph>{block.content}</Typography>;
                                    if (block.type === 'image') return <img key={block.id} src={block.content} alt="preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
                                    if (block.type === 'video') return <iframe key={block.id} src={block.content.replace('watch?v=', 'embed/')} title="preview" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', border: 'none' }} allowFullScreen />;
                                    if (block.type === 'code') return <Paper key={block.id} component="pre" sx={{ p: 2, bgcolor: 'grey.900', color: 'white', overflowX: 'auto' }}><code>{block.content}</code></Paper>;
                                    if (block.type === 'quote') return <Typography key={block.id} component="blockquote" sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 2, fontStyle: 'italic' }}>{block.content}</Typography>;
                                    return null;
                                })}
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DndProvider>
    );
};

export default CreateBlogForm;
