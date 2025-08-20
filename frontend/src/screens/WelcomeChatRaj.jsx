import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { Box, Typography, CircularProgress, LinearProgress, Fade, Slide } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

const WelcomeChatRaj = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      navigate('/chat', { replace: true });
    }, 4000);

    const progressTimer = setInterval(() => {
        setProgress((oldProgress) => {
            if (oldProgress === 100) {
                return 100;
            }
            const diff = Math.random() * 10;
            return Math.min(oldProgress + diff, 100);
        });
    }, 500);

    return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
    };
  }, [user, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
        <Slide direction="down" in={true} timeout={900}>
            <Box sx={{ mb: 4 }}>
                <SmartToy sx={{ fontSize: 80, color: 'primary.main' }} />
            </Box>
        </Slide>
        <Fade in={true} timeout={1000}>
            <Typography variant="h2" component="h1" gutterBottom>
                Welcome to <Typography variant="h2" component="span" color="primary">ChatRaj</Typography>
            </Typography>
        </Fade>
        <Slide direction="up" in={true} timeout={800}>
            <Typography variant="h6" color="text.secondary">
                Initializing Neural Interface
            </Typography>
        </Slide>
        <Box sx={{ width: '50%', mt: 4 }}>
            <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 4 }}>
            {['System Check', 'Loading Models', 'Initializing AI'].map((step, i) => (
                <Fade in={true} timeout={1500} style={{ transitionDelay: `${i * 300}ms` }} key={step}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ mb: 1 }} />
                        <Typography variant="caption">{step}</Typography>
                    </Box>
                </Fade>
            ))}
        </Box>
    </Box>
  );
};

export default WelcomeChatRaj;