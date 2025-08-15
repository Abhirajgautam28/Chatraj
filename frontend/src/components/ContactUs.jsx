import { useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    CircularProgress,
    Snackbar,
} from '@mui/material';
import { LocationOn, Mail } from '@mui/icons-material';

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setStatus('Message sent successfully!');
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setStatus('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container sx={{ py: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom>
                Contact Us
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" component="h3" gutterBottom>
                        Get in touch
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Have a question or want to work with us? Fill out the form and we&apos;ll get back to you as soon as possible.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1" color="text.secondary">
                            Bengaluru, India.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Mail sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1" color="text.secondary">
                            Abhirajgautam28@gmail.com
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Message"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ position: 'relative' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={loading}
                                    >
                                        Send Message
                                    </Button>
                                    {loading && (
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
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={status}
            />
        </Container>
    );
};

export default ContactUs;
