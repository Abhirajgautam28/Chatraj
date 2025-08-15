import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/blogs'
        );
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
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{ textAlign: 'center', mb: 8, fontWeight: 'bold' }}
        >
          From Our Blog
        </Typography>
        <Grid container spacing={4}>
          {Array.isArray(blogs) &&
            blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <Card>
                  <CardActionArea onClick={() => handleBlogClick(blog._id)}>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                      >
                        {blog.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {blog.content.substring(0, 150)}...
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
