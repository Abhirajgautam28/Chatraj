import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
} from '@mui/material';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                if (Array.isArray(response.data)) {
                    setBlogs(response.data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };
        fetchBlogs();
    }, []);

    const handleBlogClick = (blogId) => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate(`/blogs/${blogId}`);
        } else {
            navigate('/login', { state: { from: `/blogs/${blogId}` } });
        }
    };

    return (
        <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
                    From Our Blog
                </Typography>
                <Grid container spacing={4}>
                    {Array.isArray(blogs) && blogs.map((blog) => (
                        <Grid item xs={12} md={4} key={blog._id}>
                            <Card>
                                <CardActionArea onClick={() => handleBlogClick(blog._id)}>
                                    <CardContent>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="h6" component="h3" gutterBottom>
                                            {blog.title}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {blog.content.substring(0, 100)}...
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Blog;
