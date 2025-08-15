import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocationOn as LocationOnIcon, Mail as MailIcon } from '@mui/icons-material';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{ textAlign: 'center', mb: 8, fontWeight: 'bold' }}
        >
          Contact Us
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Get in touch
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Have a question or want to work with us? Fill out the form and
              we&apos;ll get back to you as soon as possible.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocationOnIcon color="primary" />
              <Typography>Bengaluru, India.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MailIcon color="primary" />
              <Typography>Abhirajgautam28@gmail.com</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Message"
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
              {status === 'success' && (
                <Alert severity="success">Message sent successfully!</Alert>
              )}
              {status === 'error' && (
                <Alert severity="error">
                  Failed to send message. Please try again.
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactUs;
