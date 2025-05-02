import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { motion } from 'framer-motion';
import 'animate.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function submitHandler(e) {
        e.preventDefault();
        axios.post('/users/register', { email, password })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                navigate('/categories', { replace: true });
            })
            .catch((err) => {
                console.error('Registration error:', err.response?.data || err);
                alert('Registration failed. Please try again.');
            });
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900">
            <div className="absolute inset-0 z-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-500 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0.2
                        }}
                        animate={{
                            y: [null, Math.random() * -1000],
                            opacity: [0.2, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl"
            >
                <h2 className="mb-6 text-2xl font-bold text-center text-white">Register</h2>
                <form onSubmit={submitHandler} className="relative z-20">
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-400">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-400">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;