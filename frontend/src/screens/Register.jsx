import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Grid,
    Modal,
    Snackbar,
    Alert
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
    const [openSnackbar, setOpenSnackbar] = useState(false);

    function submitHandler(e) {
        e.preventDefault();
        setErrorMsg('');
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            setOpenSnackbar(true);
            return;
        }
        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            setOpenSnackbar(true);
            return;
        }
        if (googleApiKey.length < 10) {
            setErrorMsg('Google API Key must be at least 10 characters long.');
            setOpenSnackbar(true);
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
                setOpenSnackbar(true);
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
                setErrorMsg('Invalid OTP. Please check your email and try again.');
                setOpenSnackbar(true);
            });
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
            <Modal
                open={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                aria-labelledby="otp-modal-title"
                aria-describedby="otp-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="otp-modal-title" variant="h6" component="h2">
                        Enter OTP
                    </Typography>
                    <Box component="form" onSubmit={handleOtpSubmit} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="otp"
                            label="OTP"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Verify OTP
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Create an Account
                </Typography>
                <Box component="form" onSubmit={submitHandler} sx={{ mt: 3 }}>
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
                            <TextField
                                required
                                fullWidth
                                id="googleApiKey"
                                label="Google API Key"
                                name="googleApiKey"
                                value={googleApiKey}
                                onChange={(e) => setGoogleApiKey(e.target.value)}
                                helperText={
                                    <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                        Get API key here
                                    </Link>
                                }
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
            </Box>
        </Container>
    );
};

export default Register;