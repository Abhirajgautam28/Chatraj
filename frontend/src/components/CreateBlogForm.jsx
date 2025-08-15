import { useState, useCallback, useRef } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Paper,
    IconButton,
    Box,
} from '@mui/material';
import {
    Add,
    Image,
    Videocam,
    Code,
    FormatQuote,
    Delete,
    DragIndicator,
} from '@mui/icons-material';

const ItemTypes = {
    BLOCK: 'block',
};

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

    const renderContent = () => {
        const commonProps = {
            fullWidth: true,
            variant: "outlined",
            value: content,
            onChange: (e) => updateContent(id, e.target.value),
        };

        switch (type) {
            case 'text':
                return <TextField {...commonProps} multiline rows={4} placeholder="Start writing your story..." />;
            case 'image':
                return <TextField {...commonProps} placeholder="Enter image URL" />;
            case 'video':
                return <TextField {...commonProps} placeholder="Enter video URL (e.g., YouTube)" />;
            case 'code':
                return <TextField {...commonProps} multiline rows={10} placeholder="Write your code here..." inputProps={{ style: { fontFamily: 'monospace' } }} />;
            case 'quote':
                return <TextField {...commonProps} multiline rows={3} placeholder="Enter a quote..." sx={{ fontStyle: 'italic', borderLeft: '4px solid', borderColor: 'primary.main', pl: 2 }} />;
            default:
                return null;
        }
    };

    return (
        <Paper
            ref={ref}
            elevation={3}
            sx={{
                p: 2,
                mb: 2,
                opacity: isDragging ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box sx={{ cursor: 'move' }}>
                <DragIndicator />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 2 }}>
                {renderContent()}
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

    const addBlockButtons = [
        { type: 'text', icon: <Add />, label: 'Text' },
        { type: 'image', icon: <Image />, label: 'Image' },
        { type: 'video', icon: <Videocam />, label: 'Video' },
        { type: 'code', icon: <Code />, label: 'Code' },
        { type: 'quote', icon: <FormatQuote />, label: 'Quote' },
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <Container sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" align="center" gutterBottom sx={{
                    fontWeight: 'bold',
                    background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Create Your Masterpiece
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Blog Title"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
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

                                <Grid container spacing={2} sx={{ my: 2 }}>
                                    {addBlockButtons.map(({ type, icon, label }) => (
                                        <Grid item key={type}>
                                            <Button
                                                variant="outlined"
                                                startIcon={icon}
                                                onClick={() => addBlock(type)}
                                            >
                                                {label}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button type="submit" variant="contained" size="large">
                                        Publish Post
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h4" component="h2" gutterBottom>
                                Live Preview
                            </Typography>
                            <Box sx={{
                                '& .prose': {
                                    color: (theme) => theme.palette.text.primary,
                                    'h1, h2, h3, h4, h5, h6': {
                                        color: (theme) => theme.palette.text.primary,
                                    },
                                },
                            }}>
                                <Typography variant="h4">{title}</Typography>
                                {blocks.map(block => {
                                    if (!block.content) return null;
                                    if (block.type === 'text') return <Typography key={block.id} paragraph>{block.content}</Typography>;
                                    if (block.type === 'image') return <img key={block.id} src={block.content} alt="preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
                                    if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="preview" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', border: 'none' }} />;
                                    if (block.type === 'code') return <Paper key={block.id} component="pre" sx={{ p: 2, overflowX: 'auto', backgroundColor: 'grey.900', color: 'white' }}><code>{block.content}</code></Paper>;
                                    if (block.type === 'quote') return <Typography key={block.id} component="blockquote" sx={{ m: 0, p: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>{block.content}</Typography>;
                                    return null;
                                })}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </DndProvider>
    );
};

export default CreateBlogForm;
