import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link as RouterLink } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Link,
} from '@mui/material';
import { Add, Favorite } from '@mui/icons-material';

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const heroRef = useRef(null);

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

    useEffect(() => {
        if (!loading && containerRef.current) {
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
            });

            gsap.to(heroRef.current, {
                backgroundPosition: '50% 100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            gsap.from(".blog-card", {
                opacity: 0,
                y: 100,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: ".blogs-grid",
                    start: "top 80%",
                }
            });
        }
    }, [loading]);

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
            <div ref={containerRef}>
                <Box
                    ref={heroRef}
                    sx={{
                        height: '100vh',
                        backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: 'white',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    }}
                >
                    <Typography variant="h1" component="h1" sx={{ zIndex: 1, fontWeight: 'bold', background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        The Dev's Diary
                    </Typography>
                    <Typography variant="h5" component="p" sx={{ zIndex: 1, mt: 2 }}>
                        Journeys in code, creativity, and community.
                    </Typography>
                </Box>

                <Container sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl size="small">
                                <InputLabel>Topic</InputLabel>
                                <Select label="Topic">
                                    <MenuItem value=""><em>All</em></MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small">
                                <InputLabel>Date</InputLabel>
                                <Select label="Date">
                                    <MenuItem value="newest">Newest</MenuItem>
                                    <MenuItem value="oldest">Oldest</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Button
                            component={RouterLink}
                            to="/blogs/create"
                            variant="contained"
                            startIcon={<Add />}
                        >
                            Create New Post
                        </Button>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={4} className="blogs-grid">
                            {blogs.map((blog) => (
                                <Grid item key={blog._id} xs={12} sm={6} md={4} className="blog-card">
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h5" component="h2" gutterBottom>
                                                <Link component={RouterLink} to={`/blogs/${blog._id}`} color="inherit" underline="hover">
                                                    {blog.title}
                                                </Link>
                                            </Typography>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                By {blog.author.firstName} {blog.author.lastName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {blog.content.substring(0, 150)}...
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Button component={RouterLink} to={`/blogs/${blog._id}`} size="small">
                                                Read More
                                            </Button>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Favorite sx={{ color: 'red', mr: 0.5 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {blog.likes.length}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </div>
        </Box>
    );
};

export default Blogs;
