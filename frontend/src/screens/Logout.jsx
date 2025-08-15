import { useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { Box, Container, Typography, CircularProgress } from '@mui/material';

const Logout = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('token');
        setUser(null);
        axios.get('/api/users/logout').catch(() => { });
        const timer = setTimeout(() => {
            navigate('/', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate, setUser]);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(to right, #1e3a8a, #111827)', color: 'white', overflow: 'hidden', position: 'relative' }}>
            <AnimatePresence>
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-10 blur-2xl"
                        initial={{ scale: 0, opacity: 0, x: Math.random() * 800 - 400, y: Math.random() * 600 - 300 }}
                        animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: i * 0.07 }}
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    />
                ))}
            </AnimatePresence>
            <Container maxWidth="sm" sx={{ textAlign: 'center', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} sx={{ mb: 4 }}>
                        <CircularProgress size={80} />
                    </motion.div>
                    <Typography variant="h4" component="h1" gutterBottom>Logging Out...</Typography>
                    <Typography variant="h6" color="text.secondary">Thank you for using ChatRaj</Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>Redirecting to home page...</Typography>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Logout;