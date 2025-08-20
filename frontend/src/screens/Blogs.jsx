import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { Link as RouterLink } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    CircularProgress
} from '@mui/material';
import { Add } from '@mui/icons-material';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                setBlogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <Box sx={{
                py: 8,
                textAlign: 'center',
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Blog Posts
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Read the latest from our community
                </Typography>
                <Button
                    component={RouterLink}
                    to="/blogs/create"
                    variant="contained"
                    startIcon={<Add />}
                >
                    Create New Post
                </Button>
            </Box>
            <Container sx={{ py: 8 }} maxWidth="lg">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {blogs.map((blog) => (
                            <Grid item key={blog._id} xs={12} sm={6} md={4}>
                                <BlogCard blog={blog} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Blogs;
