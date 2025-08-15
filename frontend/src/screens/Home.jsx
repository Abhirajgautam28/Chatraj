import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Fab,
  useTheme,
  useScrollTrigger,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Menu as MenuIcon,
  RocketLaunch as RocketLaunchIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon,
  Translate as TranslateIcon,
  PlayArrow as PlayArrowIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Support as SupportIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import ProjectShowcase from '../components/ProjectShowcase.jsx';
import UserLeaderboard from '../components/UserLeaderboard.jsx';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm.jsx';
import Blog from '../components/Blog.jsx';
import ContactUs from '../components/ContactUs.jsx';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <CodeIcon />,
    title: 'AI Code Assistant',
    description: 'Get intelligent code suggestions and solutions powered by advanced AI.'
  },
  {
    icon: <GroupIcon />,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live chat and collaborative coding.'
  },
  {
    icon: <LightbulbIcon />,
    title: 'Smart Suggestions',
    description: 'Receive context-aware tips, bug fixes, and code improvements instantly.'
  },
  {
    icon: <TranslateIcon />,
    title: 'Multi-language Support',
    description: 'Communicate in your preferred language with support for 6+ languages.'
  },
  {
    icon: <PlayArrowIcon />,
    title: 'Code Execution',
    description: 'Run and test your code directly in the browser.'
  },
  {
    icon: <SecurityIcon />,
    title: 'Privacy Focused',
    description: 'Your data is secure with local storage and customizable retention.'
  },
  {
    icon: <PaletteIcon />,
    title: 'Customizable UI',
    description: 'Personalize your experience with themes and display options.'
  },
  {
    icon: <SettingsIcon />,
    title: 'Highly Customizable',
    description: 'Adjust themes, layouts, and features to fit your workflow.'
  },
  {
    icon: <SupportIcon />,
    title: '24/7 Support',
    description: 'Get help anytime from our community and support team.'
  }
];

const faqs = [
  {
    q: "Is my code and data secure?",
    a: "Yes! ChatRaj uses secure authentication, encrypted storage, and gives you full control over your data retention."
  },
  {
    q: "Can I use ChatRaj for free?",
    a: "Absolutely! You can get started for free and upgrade as your needs grow."
  },
  {
    q: "Does ChatRaj support multiple programming languages?",
    a: "Yes, you can code and collaborate in multiple languages with AI-powered assistance."
  }
];


function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Home = () => {
  const { user } = useContext(UserContext);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/categories', { replace: true });
    }
  }, [user, navigate]);

  const handleTryChatRaj = () => {
    if (user) {
      navigate('/welcome-chatraj', { replace: true });
    } else {
      localStorage.setItem('fromTryChatRaj', 'true');
      navigate('/login', { replace: true });
    }
  };

  const AnimatedBg = () => (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 }}>
      <motion.div
        style={{
          position: 'absolute',
          background: theme.palette.primary.main,
          borderRadius: '50%',
          width: 400,
          height: 400,
          opacity: 0.1,
          filter: 'blur(100px)',
          top: -100,
          left: -150,
        }}
        initial={{ scale: 0, x: -200, y: -100 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          background: theme.palette.secondary.main,
          borderRadius: '50%',
          width: 300,
          height: 300,
          opacity: 0.1,
          filter: 'blur(100px)',
          bottom: -100,
          right: -150,
        }}
        initial={{ scale: 0, x: 200, y: 100 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      <AnimatedBg />

      <HideOnScroll>
        <AppBar position="fixed" color="transparent" sx={{ backdropFilter: 'blur(10px)', boxShadow: 'none', bgcolor: 'background.default' }}>
          <Toolbar>
            <RocketLaunchIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ChatRaj
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button color="inherit" component={Link} to="/register">Register</Button>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button variant="contained" onClick={handleTryChatRaj} sx={{ ml: 2 }}>
                Try ChatRaj
              </Button>
              <IconButton sx={{ ml: 1 }} onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />

      <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 8, md: 16 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Intelligent Software Engineering Assistant
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <Typography variant="h5" color="text.secondary" paragraph>
            Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.
          </Typography>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button variant="contained" size="large" onClick={handleTryChatRaj}>
              Try ChatRaj Free
            </Button>
            <Button variant="outlined" size="large" component={Link} to="/register">
              Create Account
            </Button>
          </Box>
        </motion.div>
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 8, fontWeight: 'bold' }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: 40, color: 'primary.main' }}>{feature.icon}</Box>
                    <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 8, fontWeight: 'bold' }}>
          Frequently Asked Questions
        </Typography>
        <Box>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ bgcolor: 'background.paper' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <ProjectShowcase />
      </Box>

      <Box sx={{ py: 8 }}>
        <UserLeaderboard />
      </Box>

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Blog />
      </Box>

      <Box sx={{ py: 8 }}>
        <ContactUs />
      </Box>

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm">
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
          Stay Updated
        </Typography>
          <NewsletterSubscribeForm />
        </Container>
      </Box>

      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <RocketLaunchIcon />
      </Fab>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} ChatRaj All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;