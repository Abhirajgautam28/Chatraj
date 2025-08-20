import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Modal,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

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
                } else if (location.state && location.state.from) {
                    navigate(location.state.from, { replace: true });
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
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Link component="button" variant="body2" onClick={() => setShowReset(true)}>
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
                    <Link component={RouterLink} to="/register" variant="body2">
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Box>

            <Modal
                open={showReset}
                onClose={() => setShowReset(false)}
                aria-labelledby="reset-password-modal-title"
                aria-describedby="reset-password-modal-description"
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
                    {!resetSuccess ? (
                        <>
                            <Typography id="reset-password-modal-title" variant="h6" component="h2">
                                Reset Password
                            </Typography>
                            {!resetOtpSent && (
                                <Box component="form" onSubmit={handleSendOtp} sx={{ mt: 2 }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="reset-email"
                                        label="Email Address"
                                        name="reset-email"
                                        autoComplete="email"
                                        autoFocus
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        disabled={resetOtpSent}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                        disabled={resetOtpSent}
                                    >
                                        {resetOtpSent ? 'OTP Sent' : 'Send OTP'}
                                    </Button>
                                    <Button onClick={() => setShowReset(false)} fullWidth>Cancel</Button>
                                    {resetError && <Typography color="error" sx={{ mt: 2 }}>{resetError}</Typography>}
                                </Box>
                            )}
                            {resetOtpSent && !resetOtpVerified && (
                                <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 2 }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="otp"
                                        label="OTP"
                                        name="otp"
                                        value={resetOtp}
                                        onChange={(e) => setResetOtp(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        disabled={!otpResendActive}
                                        onClick={async () => {
                                            if (!otpResendActive) return;
                                            setOtpResendActive(false);
                                            setOtpResendTimer(30);
                                            setResetError('');
                                            setResetError('Sending OTP...');
                                            axios.post('/users/send-otp', { email: resetEmail })
                                                .then(() => {
                                                    setResetError('OTP sent!');
                                                })
                                                .catch(() => {
                                                    setResetError('Failed to resend OTP. Please try again.');
                                                    setOtpResendTimer(0);
                                                    setOtpResendActive(true);
                                                });
                                            let timer = 30;
                                            const interval = setInterval(() => {
                                                timer--;
                                                setOtpResendTimer(timer);
                                                if (timer <= 0) {
                                                    setOtpResendActive(true);
                                                    clearInterval(interval);
                                                }
                                            }, 1000);
                                        }}
                                        sx={{ mt: 1 }}
                                    >
                                        {otpResendActive ? 'Resend OTP' : `Resend OTP (${otpResendTimer}s)`}
                                    </Button>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Verify OTP
                                    </Button>
                                    <Button onClick={() => setShowReset(false)} fullWidth>Cancel</Button>
                                    {resetError && <Typography color="error" sx={{ mt: 2 }}>{resetError}</Typography>}
                                </Box>
                            )}
                            {resetOtpVerified && (
                                <Box component="form" onSubmit={handleSetNewPassword} sx={{ mt: 2 }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="newPassword"
                                        label="New Password"
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        value={resetNewPassword}
                                        onChange={(e) => setResetNewPassword(e.target.value)}
                                        disabled={resetSuccess}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type="password"
                                        id="confirmPassword"
                                        value={resetConfirmPassword}
                                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                                        disabled={resetSuccess}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                        disabled={resetSuccess || resetInProgress}
                                    >
                                        {resetSuccess ? 'Password Reset Successful' : resetInProgress ? 'Resetting...' : 'Reset Password'}
                                    </Button>
                                    <Button onClick={() => setShowReset(false)} fullWidth disabled={resetSuccess}>Cancel</Button>
                                    {resetError && <Typography color="error" sx={{ mt: 2 }}>{resetError}</Typography>}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6">Password reset!</Typography>
                            <Typography>You can now log in with your new password.</Typography>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Container>
    );
};

export default Login;