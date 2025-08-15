import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Box, Container, Typography, CircularProgress, LinearProgress, Button, TextField,
    Avatar, Grid, Card, CardContent, IconButton, Paper
} from '@mui/material';
import { Favorite, Twitter, Facebook, LinkedIn } from '@mui/icons-material';

gsap.registerPlugin(ScrollTrigger);

const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [progress, setProgress] = useState(0);
    const { id } = useParams();
    const contentRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => { /* fetch blog logic */ }, [id]);
    useEffect(() => { /* gsap and scroll logic */ }, [blog, loading]);

    const handleLike = async () => { /* like logic */ };
    const handleComment = async (e) => { /* comment logic */ };

    const renderContent = (content) => {
        try {
            const blocks = JSON.parse(content);
            return blocks.map(block => {
                if (block.type === 'text') return <Typography key={block.id} paragraph>{block.content}</Typography>;
                if (block.type === 'image') return <Box component="img" src={block.content} alt="blog content" sx={{ my: 4, borderRadius: 2, boxShadow: 3, maxWidth: '100%' }} />;
                if (block.type === 'video') return <Box component="iframe" src={block.content.replace("watch?v=", "embed/")} title="blog video" sx={{ my: 4, width: '100%', aspectRatio: '16/9', borderRadius: 2 }} />;
                if (block.type === 'code') return <Paper key={block.id} component="pre" sx={{ p: 2, my: 4, overflowX: 'auto' }}><code>{block.content}</code></Paper>;
                if (block.type === 'quote') return <Typography key={block.id} component="blockquote" sx={{ my: 4, p: 2, borderLeft: 4, borderColor: 'primary.main', bgcolor: 'action.hover' }}>{block.content}</Typography>;
                return null;
            });
        } catch (error) {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    if (!blog) return <Typography align="center" variant="h5">Blog not found</Typography>;

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            <LinearProgress variant="determinate" value={progress} sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1300 }} />
            <Box ref={heroRef} sx={{ height: '60vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${blog.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})`, display: 'flex', alignItems: 'flex-end', p: 4, color: 'white', position: 'relative' }}>
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)' }} />
                <Container sx={{ zIndex: 1 }}>
                    <Typography variant="h2" component="h1" gutterBottom>{blog.title}</Typography>
                    <Typography variant="h6">By {blog.author.firstName} {blog.author.lastName}</Typography>
                </Container>
            </Box>
            <Container ref={contentRef} sx={{ py: 8 }}>
                <Box className="prose" sx={{ maxWidth: '80ch', mx: 'auto' }}>{renderContent(blog.content)}</Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 8, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                    <Button variant="contained" startIcon={<Favorite />} onClick={handleLike}>{blog.likes.length} Likes</Button>
                    <Box>
                        <IconButton><Twitter /></IconButton>
                        <IconButton><Facebook /></IconButton>
                        <IconButton><LinkedIn /></IconButton>
                    </Box>
                </Box>
            </Container>
            <Box sx={{ bgcolor: 'action.hover', py: 8 }}>
                <Container maxWidth="md">
                    <Typography variant="h4" gutterBottom>Comments</Typography>
                    <Box component="form" onSubmit={handleComment} sx={{ mb: 4 }}>
                        <TextField fullWidth multiline rows={4} label="Join the discussion..." value={comment} onChange={(e) => setComment(e.target.value)} />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Post Comment</Button>
                    </Box>
                    <Grid container spacing={2}>
                        {blog.comments.map((comment) => (
                            <Grid item xs={12} key={comment._id} sx={{ display: 'flex', gap: 2 }}>
                                <Avatar>{comment.user.firstName[0]}</Avatar>
                                <Box>
                                    <Typography variant="subtitle2">{comment.user.firstName} {comment.user.lastName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{comment.text}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default SingleBlogPage;
