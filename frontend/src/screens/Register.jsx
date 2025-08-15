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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import anime from 'animejs';

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
        setErrorMsg('');
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }
        if (googleApiKey.length < 10) {
            setErrorMsg('Google API Key must be at least 10 characters long.');
            return;
        }
        axios.post('/users/register', { firstName, lastName, email, password, googleApiKey })
            .then((res) => {
                setUserId(res.data.userId);
                setShowOtpModal(true);
            })
            .catch((error) => {
                if (error.response?.data?.errors) {
                    setErrorMsg(error.response.data.errors.map(e => e.msg).join(' '));
                } else {
                    setErrorMsg('Registration failed. Please try again.');
                }
            });
    }

    function handleOtpSubmit(e) {
        e.preventDefault();
        axios.post('/users/verify-otp', { userId, otp })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setShowOtpModal(false);
                navigate('/categories', { replace: true });
            })
            .catch(() => {
                alert('Invalid OTP. Please check your email and try again.');
            });
    }

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
        bgcolor: 'background.default'
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
            Create an Account
          </Typography>
          {errorMsg && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{errorMsg}</Alert>}
          <Box component="form" onSubmit={submitHandler} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Google API Key</Typography>
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" variant="body2">
                    Get API key here
                  </Link>
                </Box>
                <TextField
                  required
                  fullWidth
                  name="googleApiKey"
                  label="Google API Key"
                  id="googleApiKey"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
      <Dialog open={showOtpModal} onClose={() => setShowOtpModal(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
            <Typography>Enter the OTP sent to your email</Typography>
          <TextField
            autoFocus
            margin="dense"
            id="otp"
            label="OTP"
            type="text"
            fullWidth
            variant="standard"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOtpModal(false)}>Cancel</Button>
          <Button onClick={handleOtpSubmit}>Verify OTP</Button>
        </DialogActions>
      </Dialog>
    </Box>
    );
};

export default Register;