import React, { useState, useContext, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../context/theme.context';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { getCsrfToken } from '../config/axios';
import anime from 'animejs';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading: authLoading } = useAuth();
    const { request: resetRequest } = useApi();

    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtpSent, setResetOtpSent] = useState(false);
    const [otpResendTimer, setOtpResendTimer] = useState(0);
    const [otpResendActive, setOtpResendActive] = useState(false);
    const otpTimerRef = useRef(null);
    const [resetOtp, setResetOtp] = useState('');
    const [resetOtpVerified, setResetOtpVerified] = useState(false);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRecaptcha, setShowRecaptcha] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            anime({ targets: '.form-container', opacity: [0, 1], translateY: [50, 0], duration: 800, easing: 'easeOutExpo' });
        }
        return () => otpTimerRef.current && clearInterval(otpTimerRef.current);
    }, []);

    const isRecaptchaDisabled = import.meta.env.VITE_DISABLE_RECAPTCHA === 'true' || ['localhost', '127.0.0.1'].includes(window.location.hostname);

    async function submitHandler(e) {
        e.preventDefault();
        await getCsrfToken();
        if (isRecaptchaDisabled) handleRecaptcha('test-bypass-token');
        else setShowRecaptcha(true);
    }

    async function handleRecaptcha(token) {
        if (isRecaptchaDisabled || token) {
            const { success } = await login(email, password, token);
            if (success) {
                const from = location.state?.from || '/categories';
                navigate(from, { replace: true });
            }
            setShowRecaptcha(false);
        }
    }

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const { data } = await resetRequest({ url: '/api/users/send-otp', method: 'POST', data: { email: resetEmail } });
        if (data) {
            setResetOtpSent(true);
            setOtpResendTimer(30);
            otpTimerRef.current = setInterval(() => {
                setOtpResendTimer(t => {
                    if (t <= 1) { clearInterval(otpTimerRef.current); setOtpResendActive(true); return 0; }
                    return t - 1;
                });
            }, 1000);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const { data } = await resetRequest({ url: '/api/users/verify-otp', method: 'POST', data: { email: resetEmail, otp: resetOtp } });
        if (data) setResetOtpVerified(true);
    };

    const handleSetNewPassword = async (e) => {
        e.preventDefault();
        if (resetNewPassword !== resetConfirmPassword) return;
        const { data } = await resetRequest({ url: '/api/users/update-password', method: 'POST', data: { email: resetEmail, newPassword: resetNewPassword } });
        if (data) {
            setResetSuccess(true);
            setTimeout(() => setShowReset(false), 2500);
        }
    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen bg-transparent overflow-hidden px-4">
             <div className={`form-container relative z-10 w-full max-w-md p-8 md:p-10 backdrop-blur-md rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800/60 text-white border-gray-700' : 'bg-white/70 text-gray-900 border-white'} border`}>
                <h2 className="mb-8 text-4xl font-extrabold text-center tracking-tight">Welcome Back</h2>
                <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="your@email.com" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" required />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setShowReset(true)} className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">Forgot password?</button>
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50">
                        {authLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {showRecaptcha && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                            <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleRecaptcha} />
                            <button onClick={() => setShowRecaptcha(false)} className="mt-6 px-6 py-2 text-gray-500 font-bold hover:text-gray-700">Cancel</button>
                        </div>
                    </div>
                )}

                <p className="mt-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                    New here? <Link to="/register" className="text-blue-500 font-bold hover:underline">Create an account</Link>
                </p>
            </div>

            {/* Password Reset Modal would go here using BaseModal */}
        </div>
    );
};

export default Login;
