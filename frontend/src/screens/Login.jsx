import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import anime from 'animejs';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtpSent, setResetOtpSent] = useState(false);
    const [otpResendTimer, setOtpResendTimer] = useState(0);
    const [otpResendActive, setOtpResendActive] = useState(false);
    const [resetOtp, setResetOtp] = useState('');
    const [resetOtpVerified, setResetOtpVerified] = useState(false);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            anime({
                targets: '.form-container',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 800,
                easing: 'easeOutExpo'
            });

            anime({
                targets: '.background-shape',
                scale: [0, 1],
                rotate: '1turn',
                duration: 2000,
                easing: 'easeInOutSine',
                loop: true,
                direction: 'alternate',
                delay: anime.stagger(100)
            });
        }
    }, []);

    function submitHandler(e) {
        e.preventDefault();
        axios.post('/api/users/login', { email, password })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);

                const fromTryChatRaj = localStorage.getItem('fromTryChatRaj');
                if (fromTryChatRaj === 'true') {
                    localStorage.removeItem('fromTryChatRaj');
                    navigate('/welcome-chatraj', { replace: true });
                } else {
                    navigate('/categories', { replace: true });
                }
            })
            .catch((error) => {
                console.error('Login error:', error.response?.data || error);
                alert('Login failed. Please check your credentials.');
            });
    }

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setResetError('');
        if (!resetEmail) {
            setResetError('Please enter your email address.');
            return;
        }
        if (otpResendTimer > 0) return;
        setOtpResendTimer(30);
        setOtpResendActive(false);
        try {
            await axios.post('/users/send-otp', { email: resetEmail });
            setResetOtpSent(true);
            let timer = 30;
            const interval = setInterval(() => {
                timer--;
                setOtpResendTimer(timer);
                if (timer <= 0) {
                    setOtpResendActive(true);
                    clearInterval(interval);
                }
            }, 1000);
        } catch {
            setResetError('Failed to send OTP. Please try again.');
            setOtpResendTimer(0);
            setOtpResendActive(true);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setResetError('');
        if (!resetOtp) {
            setResetError('Please enter the OTP sent to your email.');
            return;
        }
        try {
            await axios.post('/users/verify-otp', { email: resetEmail, otp: resetOtp });
            setResetOtpVerified(true);
        } catch {
            setResetError('Invalid OTP. Please check your email and try again.');
        }
    };

    const [resetInProgress, setResetInProgress] = useState(false);
    const handleSetNewPassword = async (e) => {
        e.preventDefault();
        if (resetInProgress || resetSuccess) return;
        setResetError('');
        if (resetNewPassword.length < 8) {
            setResetError('Password must be at least 8 characters long.');
            return;
        }
        if (resetNewPassword !== resetConfirmPassword) {
            setResetError('Confirm password does not match the password you mentioned above.');
            setResetConfirmPassword('');
            return;
        }
        setResetInProgress(true);
        try {
            await axios.post('/users/update-password', {
                email: resetEmail,
                newPassword: resetNewPassword
            });
            setResetSuccess(true);
            setTimeout(() => {
                setShowReset(false);
                setResetSuccess(false);
                setResetEmail('');
                setResetOtp('');
                setResetOtpSent(false);
                setResetOtpVerified(false);
                setResetNewPassword('');
                setResetConfirmPassword('');
                setShowPassword(false);
                setResetError('');
                setResetInProgress(false);
            }, 2500);
        } catch {
            setResetError('Failed to reset password. Please try again.');
            setResetInProgress(false);
        }
    };

    return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {[...Array(10)].map((_, i) => (
        <Box
          key={i}
          className="background-shape"
          sx={{
            position: 'absolute',
            bgcolor: 'primary.main',
            borderRadius: '50%',
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.2 + 0.1,
          }}
        />
      ))}
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Welcome Back
          </Typography>
          <Box component="form" onSubmit={submitHandler} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box sx={{ textAlign: 'right', my: 1 }}>
              <Link component="button" variant="body2" onClick={() => setShowReset(true)} type="button">
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      <Dialog open={showReset} onClose={() => setShowReset(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {!resetSuccess ? (
            <>
              {!resetOtpSent ? (
                <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 1 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="reset-email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  {resetError && <Typography color="error" variant="body2">{resetError}</Typography>}
                  <DialogActions>
                    <Button onClick={() => setShowReset(false)}>Cancel</Button>
                    <Button type="submit">Send OTP</Button>
                  </DialogActions>
                </Box>
              ) : !resetOtpVerified ? (
                <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 1 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="otp"
                    label="OTP"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                  />
                   {/* Resend OTP button can be added here */}
                  {resetError && <Typography color="error" variant="body2">{resetError}</Typography>}
                  <DialogActions>
                    <Button onClick={() => setShowReset(false)}>Cancel</Button>
                    <Button type="submit">Verify OTP</Button>
                  </DialogActions>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSetNewPassword} sx={{ mt: 1 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="new-password"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="standard"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                  />
                  <TextField
                    margin="dense"
                    id="confirm-password"
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    required
                  />
                  {resetError && <Typography color="error" variant="body2">{resetError}</Typography>}
                  <DialogActions>
                    <Button onClick={() => setShowReset(false)}>Cancel</Button>
                    <Button type="submit" disabled={resetInProgress}>
                      {resetInProgress ? <CircularProgress size={24} /> : "Reset Password"}
                    </Button>
                  </DialogActions>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{textAlign: 'center', py: 3}}>
              <Typography>Password has been reset successfully!</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
    );
};

export default Login;