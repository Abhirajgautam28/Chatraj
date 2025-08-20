import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    TextField,
    Paper,
} from '@mui/material';
import { LocationOn, Email } from '@mui/icons-material';

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setStatus('Message sent successfully!');
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setStatus('Failed to send message. Please try again.');
        }
    };

    return (
        <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
                    Contact Us
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" component="h3" gutterBottom>
                            Get in touch
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Have a question or want to work with us? Fill out the form and we&apos;ll get back to you as soon as possible.
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOn sx={{ mr: 1 }} />
                            <Typography>Bengaluru, India.</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email sx={{ mr: 1 }} />
                            <Typography>Abhirajgautam28@gmail.com</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Message"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="contained" size="large">
                                {status || 'Send Message'}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ContactUs;
