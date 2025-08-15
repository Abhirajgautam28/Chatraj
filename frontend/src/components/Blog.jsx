import { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import {
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
                const response = await axios.get('http://localhost:8080/api/blogs');
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
            navigate('/login');
        }
    };

    return (
        <Container sx={{ py: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom>
                From Our Blog
            </Typography>
            <Grid container spacing={4}>
                {Array.isArray(blogs) && blogs.map((blog) => (
                    <Grid item key={blog._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardActionArea onClick={() => handleBlogClick(blog._id)}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        {blog.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {blog.content.substring(0, 100)}...
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Blog;
