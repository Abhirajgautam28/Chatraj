import React, { useState, useContext, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/theme.context';
import { useAuth } from '../hooks/useAuth';
import anime from 'animejs';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [googleApiKey, setGoogleApiKey] = useState('');

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempUserId, setTempUserId] = useState('');

    const { isDarkMode } = useContext(ThemeContext);
    const { register, verifyOtp, loading } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            anime({ targets: '.form-container', opacity: [0, 1], translateY: [50, 0], duration: 800, easing: 'easeOutExpo' });
        }
    }, []);

    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const recaptchaEnabled = import.meta.env.VITE_DISABLE_RECAPTCHA !== 'true' && !isLocalhost;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return;

        const { data } = await register({ firstName, lastName, email, password, googleApiKey });
        if (data) {
            setTempUserId(data.userId);
            if (data.otp) setOtp(data.otp);
            setShowOtpModal(true);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const { success } = await verifyOtp({ userId: tempUserId, otp });
        if (success) navigate('/categories', { replace: true });
    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen bg-transparent overflow-hidden px-4 py-12">
            <div className={`form-container relative z-10 w-full max-w-lg p-8 md:p-10 backdrop-blur-md rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gray-800/60 text-white border-gray-700' : 'bg-white/70 text-gray-900 border-white'} border`}>
                <h2 className="mb-8 text-4xl font-extrabold text-center tracking-tight">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="First Name" required />
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Last Name" required />
                    </div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Email Address" required />
                    <input type="text" value={googleApiKey} onChange={e => setGoogleApiKey(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Google Gemini API Key" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Password" required />
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Confirm" required />
                    </div>

                    <button type="submit" disabled={loading} className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Join ChatRaj'}
                    </button>
                </form>

                {showOtpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                            <h3 className="text-2xl font-bold mb-6 text-center">Verify Email</h3>
                            <form onSubmit={handleOtpSubmit} className="space-y-4">
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest" placeholder="0000000" required />
                                <button type="submit" disabled={loading} className="w-full p-4 bg-blue-600 text-white font-bold rounded-2xl">{loading ? 'Verifying...' : 'Verify & Finish'}</button>
                            </form>
                        </div>
                    </div>
                )}

                <p className="mt-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                    Already a member? <Link to="/login" className="text-blue-500 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
