import { useState } from 'react';
import axios from '../config/axios';
import {
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';

const NewsletterSubscribeForm = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        try {
            await axios.post('/api/newsletter/subscribe', { email });
            setStatus('success');
            setEmail('');
        } catch (err) {
            if (err.response?.status === 409) {
                setStatus('duplicate');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
                setStatus('error');
            } else {
                setError('Something went wrong. Please try again.');
                setStatus('error');
            }
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: '100%',
                maxWidth: 'xl',
                mx: 'auto',
            }}
        >
            <TextField
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                sx={{
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '50px',
                    },
                }}
            />
            <Box sx={{ position: 'relative' }}>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={status === 'loading' || status === 'success'}
                    sx={{ borderRadius: '50px', px: 4, py: 1.5 }}
                >
                    {status === 'success' ? 'Subscribed!' : 'Subscribe'}
                </Button>
                {status === 'loading' && (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                )}
            </Box>
            {status === 'success' && (
                <Alert severity="success" sx={{ mt: 2 }}>Thank you for subscribing!</Alert>
            )}
            {status === 'duplicate' && (
                <Alert severity="warning" sx={{ mt: 2 }}>You are already subscribed.</Alert>
            )}
            {status === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
        </Box>
    );
};

export default NewsletterSubscribeForm;
