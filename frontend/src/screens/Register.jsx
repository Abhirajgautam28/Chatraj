import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div ref={containerRef} className="relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
            {errorMsg && (
                <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg text-center font-semibold animate__animated animate__fadeInDown">
                    {errorMsg}
                </div>
            )}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-sm">
                        <h2 className="mb-4 text-xl font-bold text-center text-white">Enter OTP</h2>
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full p-3 mb-4 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the OTP sent to your email"
                                required
                            />
                            <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded hover:bg-blue-600">Verify OTP</button>
                        </form>
                    </div>
                </div>
            )}
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
                <h2 className="mb-6 text-3xl font-bold text-center text-white">Create an Account</h2>
                <form onSubmit={submitHandler}>
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>
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
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-300">
                                Google API Key
                            </label>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline whitespace-nowrap"
                            >
                                Get API key here
                            </a>
                        </div>
                        <input
                            type="text"
                            value={googleApiKey}
                            onChange={(e) => setGoogleApiKey(e.target.value)}
                            className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Enter your Google API Key"
                            required
                        />
                    </div>
                    <div className="flex gap-4 mb-6">
                        <div className="w-1/2">
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
                        <div className="w-1/2">
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 text-white font-bold transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;