import { useState, useContext, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import anime from 'animejs';
import {
    Container, Box, Paper, Typography, TextField, Button, Link, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, CircularProgress, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetStep, setResetStep] = useState(0); // 0: email, 1: otp, 2: new password
    const [resetError, setResetError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => { /* animejs effects */ }, []);

    const submitHandler = (e) => { /* submit logic */ };
    const handlePasswordReset = (e) => { /* password reset logic */ };

    return (
        <Box ref={containerRef} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'primary.dark', overflow: 'hidden', position: 'relative' }}>
            {[...Array(10)].map((_, i) => (
                <Box key={i} className="background-shape" sx={{ position: 'absolute', bgcolor: 'primary.light', borderRadius: '50%', width: `${Math.random() * 100 + 50}px`, height: `${Math.random() * 100 + 50}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.2 + 0.1 }} />
            ))}
            <Container maxWidth="xs">
                <Paper className="form-container" sx={{ p: 4, bgcolor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', color: 'white' }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>Welcome Back</Typography>
                    <Box component="form" onSubmit={submitHandler}>
                        <TextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} />
                        <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required InputLabelProps={{ sx: { color: 'white' } }} sx={{ input: { color: 'white' } }} />
                        <Box textAlign="right" mb={2}>
                            <Link component="button" variant="body2" onClick={() => setShowReset(true)}>Forgot password?</Link>
                        </Box>
                        <Button type="submit" variant="contained" fullWidth size="large">Login</Button>
                    </Box>
                    <Typography align="center" mt={2}>Don&apos;t have an account?{' '}
                        <Link component={RouterLink} to="/register">Sign up</Link>
                    </Typography>
                </Paper>
            </Container>

            <Dialog open={showReset} onClose={() => setShowReset(false)}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    {resetError && <Alert severity="error">{resetError}</Alert>}
                    {resetStep === 0 && <TextField autoFocus margin="dense" label="Email Address" type="email" fullWidth variant="standard" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />}
                    {resetStep === 1 && <TextField autoFocus margin="dense" label="OTP" type="text" fullWidth variant="standard" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} />}
                    {resetStep === 2 && <>
                        <TextField autoFocus margin="dense" label="New Password" type={showPassword ? 'text' : 'password'} fullWidth variant="standard" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)}
                            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                        <TextField margin="dense" label="Confirm New Password" type="password" fullWidth variant="standard" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} />
                    </>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReset(false)}>Cancel</Button>
                    <Button onClick={handlePasswordReset} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (resetStep === 2 ? "Reset Password" : "Next")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Login;