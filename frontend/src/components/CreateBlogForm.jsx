import React, { useState, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  IconButton,
  ButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
  Code as CodeIcon,
  FormatQuote as FormatQuoteIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const renderBlockContent = () => {
    const commonProps = {
      fullWidth: true,
      multiline: true,
      variant: 'outlined',
      value: content,
      onChange: (e) => updateContent(id, e.target.value),
    };
    switch (type) {
      case 'text':
        return <TextField {...commonProps} label="Text" rows={4} />;
      case 'image':
        return <TextField {...commonProps} label="Image URL" rows={1} />;
      case 'video':
        return <TextField {...commonProps} label="Video URL" rows={1} />;
      case 'code':
        return <TextField {...commonProps} label="Code" rows={8} />;
      case 'quote':
        return <TextField {...commonProps} label="Quote" rows={2} />;
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
        gap: 2,
      }}
    >
      <DragIndicatorIcon sx={{ cursor: 'move' }} />
      <Box sx={{ flexGrow: 1 }}>{renderBlockContent()}</Box>
      <IconButton onClick={() => deleteBlock(id)} color="error">
        <DeleteIcon />
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
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
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
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Create Your Masterpiece
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Blog Title"
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

                  <ButtonGroup fullWidth variant="outlined" sx={{ my: 2 }}>
                    <Button onClick={() => addBlock('text')} startIcon={<TextFieldsIcon />}>Text</Button>
                    <Button onClick={() => addBlock('image')} startIcon={<ImageIcon />}>Image</Button>
                    <Button onClick={() => addBlock('video')} startIcon={<VideocamIcon />}>Video</Button>
                    <Button onClick={() => addBlock('code')} startIcon={<CodeIcon />}>Code</Button>
                    <Button onClick={() => addBlock('quote')} startIcon={<FormatQuoteIcon />}>Quote</Button>
                  </ButtonGroup>

                  <Button type="submit" variant="contained" fullWidth size="large">
                    Publish Post
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Live Preview
                </Typography>
                <Box>
                  <Typography variant="h4">{title}</Typography>
                  {blocks.map((block) => {
                    if (block.type === 'text') return <Typography key={block.id}>{block.content}</Typography>;
                    if (block.type === 'image') return <img key={block.id} src={block.content} alt="preview" style={{maxWidth: '100%', borderRadius: 8}} />;
                    if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="preview" style={{width: '100%', aspectRatio: '16/9', borderRadius: 8}} />;
                    if (block.type === 'code') return <pre key={block.id}><code>{block.content}</code></pre>;
                    if (block.type === 'quote') return <Typography key={block.id} component="blockquote" sx={{fontStyle: 'italic', borderLeft: 4, borderColor: 'primary.main', pl: 2}}>{block.content}</Typography>;
                    return null;
                  })}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DndProvider>
  );
};

export default CreateBlogForm;
