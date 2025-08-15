import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { Box, Container, Typography, LinearProgress } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

const WelcomeChatRaj = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }

        const timer = setTimeout(() => {
            navigate('/chat', { replace: true });
        }, 4000);

        return () => clearTimeout(timer);
    }, [user, navigate]);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#0A0A0F',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 0%, rgba(62, 87, 229, 0.15), transparent 70%)',
            }} />
            <Container>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9 }}
                        style={{ display: 'inline-block', padding: '2rem', background: 'linear-gradient(135deg, rgba(62, 87, 229, 0.1), rgba(101, 76, 255, 0.1))', borderRadius: '50%', boxShadow: 'inset 0 0 20px rgba(62, 87, 229, 0.2)', marginBottom: '2rem' }}
                    >
                        <SmartToy sx={{ fontSize: '5rem', color: 'primary.main' }} />
                    </motion.div>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Welcome to <Typography component="span" variant="h2" sx={{ color: 'primary.main' }}>ChatRaj</Typography>
                    </Typography>
                    <Typography variant="h6" color="text.secondary">Initializing Neural Interface</Typography>
                    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 4 }}>
                        <LinearProgress />
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default WelcomeChatRaj;