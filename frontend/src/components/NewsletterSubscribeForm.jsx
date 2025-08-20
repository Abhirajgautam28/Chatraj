import { useState } from 'react';
import axios from '../config/axios';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Typography,
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
            gap: 2,
            maxWidth: 'md',
            mx: 'auto',
        }}
    >
        <TextField
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            variant="outlined"
            disabled={status === 'loading' || status === 'success'}
            sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
        />
        <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={status === 'loading' || status === 'success'}
            sx={{ borderRadius: '50px', px: 4, py: 1.5 }}
        >
            {status === 'loading' ? <CircularProgress size={24} /> : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </Button>
        {status === 'success' && (
            <Typography color="success.main" sx={{ mt: 1 }}>Thank you for subscribing!</Typography>
        )}
        {status === 'duplicate' && (
            <Typography color="warning.main" sx={{ mt: 1 }}>You are already subscribed.</Typography>
        )}
        {status === 'error' && (
            <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
        )}
    </Box>
  );
};

export default NewsletterSubscribeForm;
