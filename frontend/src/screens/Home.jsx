import ProjectShowcase from '../components/ProjectShowcase.jsx';
import UserLeaderboard from '../components/UserLeaderboard.jsx';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm.jsx';
import Blog from '../components/Blog.jsx';
import ContactUs from '../components/ContactUs.jsx';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, Grid, Card, CardContent,
    Paper, Accordion, AccordionSummary, AccordionDetails, Fab, Menu, MenuItem, Icon, Link
} from '@mui/material';
import {
    Menu as MenuIcon, Brightness4, Brightness7, RocketLaunch, ExpandMore, SmartToy,
    Code, People, Lightbulb, Translate, Shield, Palette, Settings, SupportAgent,
    Speed, Lock, Build, Help, GitHub, Login, AppRegistration
} from '@mui/icons-material';

const Home = () => {
    const { user } = useContext(UserContext);
    const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => { /* snip */ }, [user, navigate]);
    useEffect(() => { /* snip */ }, [lastScrollY]);

    const handleTryChatRaj = () => { /* snip */ };
    const handleFabClick = (event) => setAnchorEl(event.currentTarget);
    const handleFabClose = () => setAnchorEl(null);

    const features = [
        { icon: <SmartToy />, title: 'AI Code Assistant', description: 'Get intelligent code suggestions and solutions powered by advanced AI.' },
        { icon: <People />, title: 'Real-time Collaboration', description: 'Work together seamlessly with live chat and collaborative coding.' },
        { icon: <Lightbulb />, title: 'Smart Suggestions', description: 'Receive context-aware tips, bug fixes, and code improvements instantly.' },
        { icon: <Translate />, title: 'Multi-language Support', description: 'Communicate in your preferred language with support for 6+ languages.' },
        { icon: <Code />, title: 'Code Execution', description: 'Run and test your code directly in the browser.' },
        { icon: <Shield />, title: 'Privacy Focused', description: 'Your data is secure with local storage and customizable retention.' },
        { icon: <Palette />, title: 'Customizable UI', description: 'Personalize your experience with themes and display options.' },
        { icon: <Settings />, title: 'Highly Customizable', description: 'Adjust themes, layouts, and features to fit your workflow.' },
        { icon: <SupportAgent />, title: '24/7 Support', description: 'Get help anytime from our community and support team.' }
    ];

    const faqs = [
        { q: "Is my code and data secure?", a: "Yes! ChatRaj uses secure authentication, encrypted storage, and gives you full control over your data retention." },
        { q: "Can I use ChatRaj for free?", a: "Absolutely! You can get started for free and upgrade as your needs grow." },
        { q: "Does ChatRaj support multiple programming languages?", a: "Yes, you can code and collaborate in multiple languages with AI-powered assistance." }
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <SmartToy sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>ChatRaj</Typography>
                    <Button component={RouterLink} to="/register" color="inherit">Register</Button>
                    <Button component={RouterLink} to="/login" color="inherit">Login</Button>
                    <Button variant="contained" onClick={handleTryChatRaj}>Try ChatRaj</Button>
                    <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit"><Brightness4 /></IconButton>
                </Toolbar>
            </AppBar>
            <main>
                <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', py: 8 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Typography variant="h2" component="h1" gutterBottom>Your Intelligent Software Engineering Assistant</Typography>
                        <Typography variant="h5" color="text.secondary" paragraph>Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.</Typography>
                        <Button variant="contained" size="large" onClick={handleTryChatRaj} sx={{ mr: 2 }}>Try ChatRaj Free</Button>
                        <Button component={RouterLink} to="/register" variant="outlined" size="large">Create Account</Button>
                    </motion.div>
                </Container>
                <Container sx={{ py: 8 }}>
                    <Typography variant="h4" align="center" gutterBottom>Key Features</Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                                    <Card sx={{ height: '100%' }}><CardContent><ListItemIcon>{feature.icon}</ListItemIcon><Typography variant="h6">{feature.title}</Typography><Typography color="text.secondary">{feature.description}</Typography></CardContent></Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
                <Container sx={{ py: 8 }}>
                    <Typography variant="h4" align="center" gutterBottom>Frequently Asked Questions</Typography>
                    {faqs.map((faq, i) => (
                        <Accordion key={i}><AccordionSummary expandIcon={<ExpandMore />}>{faq.q}</AccordionSummary><AccordionDetails>{faq.a}</AccordionDetails></Accordion>
                    ))}
                </Container>
                <Container sx={{ py: 8 }}><Blog /></Container>
                <Container sx={{ py: 8 }}><ContactUs /></Container>
                <Container sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>Stay Updated</Typography>
                    <Typography color="text.secondary" paragraph>Subscribe to our newsletter for the latest features and updates.</Typography>
                    <NewsletterSubscribeForm />
                </Container>
            </main>
            <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleFabClick}><RocketLaunch /></Fab>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFabClose}>
                <MenuItem onClick={() => { handleTryChatRaj(); handleFabClose(); }}>Try ChatRaj</MenuItem>
                <MenuItem component={RouterLink} to="/register" onClick={handleFabClose}>Create Account</MenuItem>
                <MenuItem component={RouterLink} to="/login" onClick={handleFabClose}>Login</MenuItem>
                <MenuItem component="a" href="https://github.com/Abhirajgautam28/Chatraj" target="_blank" onClick={handleFabClose}>GitHub</MenuItem>
            </Menu>
            <Box component="footer" sx={{ p: 2, textAlign: 'center' }}><Typography>© 2025 ChatRaj All rights reserved.</Typography></Box>
        </Box>
    );
};

export default Home;