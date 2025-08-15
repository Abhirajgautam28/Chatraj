import { useState, useContext, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import anime from 'animejs';
import {
    Container, Box, Paper, Typography, TextField, Button, Link, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid
} from '@mui/material';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');
    const containerRef = useRef(null);

    useEffect(() => { /* animejs effects */ }, []);

    const submitHandler = (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        axios.post('/users/register', { firstName, lastName, email, password, googleApiKey })
            .then((res) => {
                setUserId(res.data.userId);
                setShowOtpModal(true);
            })
            .catch((error) => {
                setErrorMsg(error.response?.data?.errors?.map(e => e.msg).join(' ') || 'Registration failed.');
            });
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        axios.post('/users/verify-otp', { userId, otp })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setShowOtpModal(false);
                navigate('/categories', { replace: true });
            })
            .catch(() => alert('Invalid OTP.'));
    };

    return (
        <Box ref={containerRef} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'primary.dark', overflow: 'hidden', position: 'relative' }}>
            {errorMsg && <Alert severity="error" sx={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1301 }}>{errorMsg}</Alert>}
            <Dialog open={showOtpModal} onClose={() => setShowOtpModal(false)}>
                <DialogTitle>Enter OTP</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="OTP" type="text" fullWidth variant="standard" value={otp} onChange={e => setOtp(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleOtpSubmit} variant="contained">Verify OTP</Button>
                </DialogActions>
            </Dialog>
            {[...Array(10)].map((_, i) => (
                <Box key={i} className="background-shape" sx={{ position: 'absolute', bgcolor: 'primary.light', borderRadius: '50%', width: `${Math.random() * 100 + 50}px`, height: `${Math.random() * 100 + 50}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.2 + 0.1 }} />
            ))}
            <Container maxWidth="sm">
                <Paper className="form-container" sx={{ p: 4, bgcolor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', color: 'white' }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>Create an Account</Typography>
                    <Box component="form" onSubmit={submitHandler}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField label="First Name" variant="outlined" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField label="Last Name" variant="outlined" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                            <Grid item xs={12}><TextField label="Email" type="email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                            <Grid item xs={12}><TextField label="Google API Key" variant="outlined" fullWidth value={googleApiKey} onChange={(e) => setGoogleApiKey(e.target.value)} required helperText={<Link href="https://aistudio.google.com/app/apikey" target="_blank">Get API key here</Link>} InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField label="Password" type="password" variant="outlined" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField label="Confirm Password" type="password" variant="outlined" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} /></Grid>
                        </Grid>
                        <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>Register</Button>
                    </Box>
                    <Typography align="center" mt={2}>Already have an account?{' '}
                        <Link component={RouterLink} to="/login">Login</Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;