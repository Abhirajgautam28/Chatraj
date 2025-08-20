import ProjectShowcase from '../components/ProjectShowcase.jsx';
import UserLeaderboard from '../components/UserLeaderboard.jsx';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm.jsx';
import Blog from '../components/Blog.jsx';
import ContactUs from '../components/ContactUs.jsx';
import ThreeHero from '../components/ThreeHero.jsx';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Paper,
    useScrollTrigger,
    Slide,
    Fab,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4,
    Brightness7,
    Code,
    Group,
    Lightbulb,
    Translate,
    Security,
    Palette,
    Settings,
    Support,
    FlashOn,
    Lock,
    RocketLaunch,
    Add,
    Login,
    GitHub,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

// Newsletter API endpoint for subscription
const NEWSLETTER_API_URL =
  import.meta.env.VITE_NEWSLETTER_API_URL ||
  'https://chatraj-backend.onrender.com/api/newsletter/subscribe';

// 9 Key Features for a balanced grid
const features = [
  {
    icon: <Code fontSize="large" color="primary" />,
    title: 'AI Code Assistant',
    description: 'Get intelligent code suggestions and solutions powered by advanced AI.'
  },
  {
    icon: <Group fontSize="large" color="primary" />,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live chat and collaborative coding.'
  },
  {
    icon: <Lightbulb fontSize="large" color="primary" />,
    title: 'Smart Suggestions',
    description: 'Receive context-aware tips, bug fixes, and code improvements instantly.'
  },
  {
    icon: <Translate fontSize="large" color="primary" />,
    title: 'Multi-language Support',
    description: 'Communicate in your preferred language with support for 6+ languages.'
  },
  {
    icon: <Code fontSize="large" color="primary" />,
    title: 'Code Execution',
    description: 'Run and test your code directly in the browser.'
  },
  {
    icon: <Security fontSize="large" color="primary" />,
    title: 'Privacy Focused',
    description: 'Your data is secure with local storage and customizable retention.'
  },
  {
    icon: <Palette fontSize="large" color="primary" />,
    title: 'Customizable UI',
    description: 'Personalize your experience with themes and display options.'
  },
  {
    icon: <Settings fontSize="large" color="primary" />,
    title: 'Highly Customizable',
    description: 'Adjust themes, layouts, and features to fit your workflow.'
  },
  {
    icon: <Support fontSize="large" color="primary" />,
    title: '24/7 Support',
    description: 'Get help anytime from our community and support team.'
  }
];

const useCases = [
  {
    icon: <Lightbulb fontSize="large" color="primary" />,
    title: 'Learning & Experimentation',
    description: 'Practice coding, learn new languages, and experiment with AI-powered suggestions.'
  },
  {
    icon: <Group fontSize="large" color="primary" />,
    title: 'Team Projects',
    description: 'Collaborate with your team on real-world projects in real time.'
  },
  {
    icon: <Code fontSize="large" color="primary" />,
    title: 'Interview Preparation',
    description: 'Sharpen your coding skills and prepare for interviews with instant feedback.'
  }
];

const benefits = [
  {
    icon: <FlashOn fontSize="large" color="primary" />,
    title: 'Lightning Fast',
    description: 'Experience instant code suggestions and real-time collaboration.'
  },
  {
    icon: <Lock fontSize="large" color="primary" />,
    title: 'Secure & Private',
    description: 'Your code and data are encrypted and never shared without your consent.'
  },
  {
    icon: <Settings fontSize="large" color="primary" />,
    title: 'Highly Customizable',
    description: 'Adjust themes, layouts, and features to fit your workflow.'
  },
  {
    icon: <Support fontSize="large" color="primary" />,
    title: '24/7 Support',
    description: 'Get help anytime from our community and support team.'
  }
];

const techStack = [
    { icon: <Code />, name: 'React' },
    { icon: <Code />, name: 'Node.js' },
    { icon: <Code />, name: 'JavaScript' },
    { icon: <Code />, name: 'MongoDB' },
    { icon: <Code />, name: 'Socket.io' },
    { icon: <Code />, name: 'Google GenAI' },
    { icon: <Code />, name: 'Material-UI' },
    { icon: <GitHub />, name: 'GitHub' }
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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HideOnScroll>
        <AppBar color="transparent" sx={{ backdropFilter: 'blur(10px)' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ChatRaj
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={RouterLink} to="/register" color="inherit">Register</Button>
              <Button component={RouterLink} to="/login" color="inherit">Login</Button>
              <Button onClick={handleTryChatRaj} variant="contained">Try ChatRaj</Button>
            </Box>
            <IconButton sx={{ ml: 1 }} onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleClick}
                    color="inherit"
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose} component={RouterLink} to="/register">Register</MenuItem>
                    <MenuItem onClick={handleClose} component={RouterLink} to="/login">Login</MenuItem>
                    <MenuItem onClick={() => { handleClose(); handleTryChatRaj(); }}>Try ChatRaj</MenuItem>
                </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Hero */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          pt: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Intelligent Software Engineering Assistant
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button onClick={handleTryChatRaj} variant="contained" size="large" sx={{ mr: 2 }}>
              Try ChatRaj Free
            </Button>
            <Button component={RouterLink} to="/register" variant="outlined" size="large">
              Create Account
            </Button>
          </Box>
          <Paper elevation={3} sx={{ p: 2, mt: 4, textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
            <pre>
{`// AI-powered code suggestion
function greet(name) {
  return \`Hello, \${name} 👋\`;
}

// Real-time collaboration enabled!
`}
            </pre>
          </Paper>
        </Container>
        <Box sx={{ position: 'absolute', top: '10%', left: '10%', zIndex: -1 }}>
            <ThreeHero />
        </Box>
      </Box>

      {/* Features */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Key Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    {feature.icon}
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Popular Use Cases
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {useCases.map((useCase, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    {useCase.icon}
                    <Typography variant="h6" component="h3" gutterBottom>
                      {useCase.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {useCase.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Why Choose ChatRaj
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    {benefit.icon}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Powered By
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {techStack.map((tech, index) => (
              <Grid item xs={6} sm={3} md={3} key={index}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  {tech.icon}
                  <Typography>{tech.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        How ChatRaj Works
                    </Typography>
                    <Box component="ol" sx={{ pl: 2 }}>
                        <li>Register or log in to your account.</li>
                        <li>Create or join a project and invite your team.</li>
                        <li>Start coding with AI-powered suggestions and real-time chat.</li>
                        <li>Run, test, and review code collaboratively.</li>
                        <li>Export, share, and manage your projects securely.</li>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                <svg className="w-full h-auto max-w-xs" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="160" cy="200" rx="120" ry="18" fill="#1e293b" opacity="0.5"/>
              <rect x="60" y="40" width="200" height="120" rx="20" fill="#334155" stroke="#60a5fa" strokeWidth="3"/>
              <rect x="90" y="70" width="140" height="60" rx="12" fill="#1e293b" stroke="#818cf8" strokeWidth="2"/>
              <rect x="120" y="90" width="80" height="20" rx="6" fill="#38bdf8" opacity="0.7"/>
              <circle cx="100" cy="60" r="8" fill="#38bdf8"/>
              <circle cx="220" cy="60" r="8" fill="#818cf8"/>
              <circle cx="160" cy="170" r="12" fill="#f472b6"/>
              <rect x="140" y="120" width="40" height="10" rx="3" fill="#fbbf24" opacity="0.7"/>
              <rect x="110" y="110" width="100" height="6" rx="2" fill="#64748b" opacity="0.5"/>
            </svg>
                </Grid>
            </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <ProjectShowcase />
        </Container>
      </Box>

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <UserLeaderboard />
        </Container>
      </Box>

      {/* FAQ */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}a-content`}
                id={`panel${index}a-header`}
              >
                <Typography>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      <Blog />
      <ContactUs />

      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Stay Updated
          </Typography>
          <Typography color="text.secondary" paragraph>
            Subscribe to our newsletter for the latest features and updates.
          </Typography>
          <NewsletterSubscribeForm apiUrl={NEWSLETTER_API_URL} />
        </Container>
      </Box>

      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleClick}>
        <RocketLaunch />
      </Fab>
      <Menu
        id="fab-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); handleTryChatRaj(); }}>
            <ListItemIcon><Code fontSize="small" /></ListItemIcon>
            <ListItemText>Try ChatRaj</ListItemText>
        </MenuItem>
        <MenuItem component="a" href="https://github.com/Abhirajgautam28/Chatraj" target="_blank" rel="noopener noreferrer">
            <ListItemIcon><GitHub fontSize="small" /></ListItemIcon>
            <ListItemText>GitHub</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to="/register">
            <ListItemIcon><Add fontSize="small" /></ListItemIcon>
            <ListItemText>Create Account</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to="/login">
            <ListItemIcon><Login fontSize="small" /></ListItemIcon>
            <ListItemText>Login</ListItemText>
        </MenuItem>
      </Menu>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'background.paper', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary">
            © 2025 ChatRaj All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;