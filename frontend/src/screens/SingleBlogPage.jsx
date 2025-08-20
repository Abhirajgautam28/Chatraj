import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    TextField,
    Paper,
    Avatar,
    CircularProgress,
    IconButton,
    Link,
} from '@mui/material';
import { Favorite, Twitter, Facebook, LinkedIn } from '@mui/icons-material';

const Comment = ({ comment }) => {
    if (!comment) return null;
    const user = comment.user || {};
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const avatar = firstName && typeof firstName === 'string' ? firstName[0] : '?';
    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{avatar}</Avatar>
            <Box>
                <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
                    {firstName} {lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {comment.text || ''}
                </Typography>
            </Box>
        </Box>
    );
};
Comment.propTypes = {
    comment: PropTypes.shape({
        user: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
        }),
        text: PropTypes.string,
    }),
};

const SingleBlogPage = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/blogs/${id}`);
                setBlog(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`/api/blogs/like/${id}`);
            setBlog(response.data);
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/blogs/comment/${id}`, { text: comment });
            setBlog(response.data);
            setComment('');
        } catch (error) {
            console.error('Error commenting on blog:', error);
        }
    };

    const renderContent = (content) => {
        try {
            const blocks = JSON.parse(content);
            return blocks.map(block => {
                if (block.type === 'text') return <Typography key={block.id} paragraph>{block.content}</Typography>;
                if (block.type === 'image') return <img key={block.id} src={block.content} alt="blog content" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
                if (block.type === 'video') return <iframe key={block.id} src={block.content.replace("watch?v=", "embed/")} title="blog video" style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: '8px' }} />;
                if (block.type === 'code') return <Paper key={block.id} component="pre" sx={{ p: 2, bgcolor: 'grey.900', color: 'white', overflowX: 'auto' }}><code>{block.content}</code></Paper>;
                if (block.type === 'quote') return <Typography key={block.id} component="blockquote" sx={{ borderLeft: 4, borderColor: 'primary.main', pl: 2, fontStyle: 'italic' }}>{block.content}</Typography>;
                return null;
            });
        } catch {
            return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
    }

    if (!blog) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Typography variant="h4">Blog not found</Typography></Box>;
    }

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
            <Box sx={{ py: 8, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h3" component="h1" gutterBottom>{blog.title}</Typography>
                <Typography variant="subtitle1" color="text.secondary">By {blog.author.firstName} {blog.author.lastName}</Typography>
            </Box>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, mt: 4 }}>
                    {renderContent(blog.content)}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Button
                            variant="contained"
                            startIcon={<Favorite />}
                            onClick={handleLike}
                        >
                            {blog.likes.length} Likes
                        </Button>
                        <Box>
                            <IconButton component={Link} href={`https://twitter.com/intent/tweet?text=${blog.title}`} target="_blank"><Twitter /></IconButton>
                            <IconButton component={Link} href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank"><Facebook /></IconButton>
                            <IconButton component={Link} href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`} target="_blank"><LinkedIn /></IconButton>
                        </Box>
                    </Box>
                </Paper>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>Comments</Typography>
                    <Box component="form" onSubmit={handleComment} sx={{ mb: 4 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Join the discussion..."
                            variant="outlined"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Post Comment</Button>
                    </Box>
                    <Grid container spacing={2}>
                        {blog.comments.map((comment) => (
                            <Grid item xs={12} key={comment._id}>
                                <Comment comment={comment} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default SingleBlogPage;