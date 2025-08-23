import { useState, useContext, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import anime from 'animejs';

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

    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [loginError, setLoginError] = useState('');

    function submitHandler(e) {
        e.preventDefault();
        setShowRecaptcha(true);
    }

    function handleRecaptcha(token) {
        setRecaptchaToken(token);
        setLoginError('');
        if (token) {
            console.log('reCAPTCHA token:', token);
            axios.post('/api/users/login', { email, password })
                .then((res) => {
                    localStorage.setItem('token', res.data.token);
                    setUser(res.data.user);

                    const fromTryChatRaj = localStorage.getItem('fromTryChatRaj');
                    if (fromTryChatRaj === 'true') {
                        localStorage.removeItem('fromTryChatRaj');
                        navigate('/welcome-chatraj', { replace: true });
                    } else if (location.state && location.state.from) {
                        // If user came from a blog tile click and wants to go to main blog page
                        if (localStorage.getItem('redirectToBlogPage') === 'true' && location.state.from === 'homepage-blog-tile') {
                            localStorage.removeItem('redirectToBlogPage');
                            navigate('/blogs', { replace: true });
                        } else {
                            navigate(location.state.from, { replace: true });
                        }
                    } else {
                        navigate('/categories', { replace: true });
                    }
                    setShowRecaptcha(false);
                })
                .catch((error) => {
                    console.error('Login error:', error.response?.data || error);
                    setLoginError('Login failed. Please check your credentials.');
                    setShowRecaptcha(false);
                });
        } else {
            setLoginError('reCAPTCHA verification failed. Please try again.');
        }
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
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
            <div className="absolute inset-0 z-0">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="background-shape absolute bg-blue-500 rounded-full"
                        style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.2 + 0.1,
                        }}
                    />
                ))}
            </div>

            <div className="form-container relative z-10 w-full max-w-md p-8 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl">
                <h2 className="mb-6 text-3xl font-bold text-center text-white">Welcome Back</h2>
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="mb-6 text-right">
                        <button
                            type="button"
                            onClick={() => setShowReset(true)}
                            className="text-sm text-blue-400 hover:underline focus:outline-none"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 text-white font-bold transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>
                {showRecaptcha && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
                            {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                                <ReCAPTCHA
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                    onChange={handleRecaptcha}
                                />
                            ) : (
                                <div className="text-red-600 font-semibold text-center mb-4">reCAPTCHA site key is missing. Please set VITE_RECAPTCHA_SITE_KEY in your environment variables.</div>
                            )}
                            <button className="mt-4 px-4 py-2 bg-gray-700 text-white rounded" onClick={() => setShowRecaptcha(false)} type="button">Cancel</button>
                        </div>
                    </div>
                )}

                {loginError && (
                    <div className="mt-4 text-center text-red-500 font-semibold">{loginError}</div>
                )}
                <p className="mt-6 text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="text-blue-400 font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>

            {showReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-2xl">
                        {!resetSuccess ? (
                            <>
                                <h3 className="mb-4 text-xl font-bold text-center text-white">Reset Password</h3>
                                {!resetOtpSent && (
                                    <form onSubmit={handleSendOtp}>
                                        <label className="block mb-2 text-sm font-medium text-gray-400">
                                            Enter your email address
                                        </label>
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full p-3 mb-4 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter your email"
                                            required
                                            disabled={resetOtpSent}
                                        />
                                        <button
                                            type="submit"
                                            className="w-full p-3 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={resetOtpSent}
                                        >
                                            {resetOtpSent ? 'OTP Sent' : 'Send OTP'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowReset(false);
                                                setResetOtpSent(false);
                                                setResetEmail('');
                                                setResetError('');
                                            }}
                                            className="w-full p-2 mt-3 text-sm text-gray-300 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        {resetError && <div className="mt-2 text-sm text-red-400 text-center">{resetError}</div>}
                                    </form>
                                )}
                                {resetOtpSent && !resetOtpVerified && (
                                    <form onSubmit={handleVerifyOtp}>
                                        <label className="block mb-2 text-sm font-medium text-gray-400">
                                            Enter OTP sent to your email
                                        </label>
                                        <input
                                            type="text"
                                            value={resetOtp}
                                            onChange={e => setResetOtp(e.target.value)}
                                            className="w-full p-3 mb-2 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter OTP"
                                            required
                                        />
                                        <div className="flex flex-col items-center mb-4">
                                            <button
                                                type="button"
                                                className={`w-full flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transition duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!otpResendActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                disabled={!otpResendActive}
                                                onClick={async () => {
                                                    if (!otpResendActive) return;
                                                    setOtpResendActive(false);
                                                    setOtpResendTimer(30);
                                                    setResetError('');
                                                    // Show instant feedback
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
                                            >
                                                <i className="ri-refresh-line text-lg"></i>
                                                {otpResendActive ? 'Resend OTP' : `Resend OTP (${otpResendTimer}s)`}
                                            </button>
                                            <span className="mt-2 text-xs text-gray-400">Didn&apos;t receive OTP?</span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full p-3 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Verify OTP
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReset(false)}
                                            className="w-full p-2 mt-3 text-sm text-gray-300 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        {resetError && <div className="mt-2 text-sm text-red-400 text-center">{resetError}</div>}
                                    </form>
                                )}
                                {resetOtpVerified && (
                                    <form onSubmit={handleSetNewPassword}>
                                        <label className="block mb-2 text-sm font-medium text-gray-400">
                                            New Password
                                        </label>
                                        <div className="relative mb-4">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={resetNewPassword}
                                                onChange={e => setResetNewPassword(e.target.value)}
                                                className="w-full p-3 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                placeholder="Enter new password"
                                                required
                                                disabled={resetSuccess}
                                            />
                                            <span
                                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`ri-eye${showPassword ? '' : '-close'}-line text-xl text-gray-400`}></i>
                                            </span>
                                        </div>
                                        <label className="block mb-2 text-sm font-medium text-gray-400">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={resetConfirmPassword}
                                            onChange={e => setResetConfirmPassword(e.target.value)}
                                            className="w-full p-3 mb-4 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Confirm new password"
                                            required
                                            disabled={resetSuccess}
                                        />
                                        <button
                                            type="submit"
                                            className={`w-full p-3 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${resetInProgress ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            disabled={resetSuccess || resetInProgress}
                                        >
                                            {resetSuccess ? 'Password Reset Successful' : resetInProgress ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReset(false)}
                                            className="w-full p-2 mt-3 text-sm text-gray-300 hover:text-white"
                                            disabled={resetSuccess}
                                        >
                                            Cancel
                                        </button>
                                        {resetError && <div className="mt-2 text-sm text-red-400 text-center">{resetError}</div>}
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <i className="mb-4 text-4xl text-blue-400 ri-checkbox-circle-line"></i>
                                <p className="mb-2 text-lg font-semibold text-white">Password reset!</p>
                                <p className="text-center text-gray-400">You can now log in with your new password.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;