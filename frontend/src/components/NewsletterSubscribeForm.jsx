import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../config/axios';

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
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', maxWidth: 'sm' }}
    >
      <TextField
        type="email"
        label="Enter your email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        disabled={status === 'loading' || status === 'success'}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={status === 'loading' || status === 'success'}
        startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
      >
        {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
      </Button>
      {status === 'success' && (
        <Alert severity="success">Thank you for subscribing!</Alert>
      )}
      {status === 'duplicate' && (
        <Alert severity="warning">You are already subscribed.</Alert>
      )}
      {status === 'error' && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default NewsletterSubscribeForm;
