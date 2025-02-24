import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import './Login.css'
import 'animate.css';

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const { setUser } = useContext(UserContext)
    const navigate = useNavigate()

    function submitHandler(e) {
        e.preventDefault()

        axios.post('/users/login', { email, password })
            .then((res) => {
                console.log(res.data)
                localStorage.setItem('token', res.data.token)
                setUser(res.data.user)
                navigate('/categories')
            })
            .catch((err) => {
                console.log(err.response.data)
            })
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-800 to-gray-900 animate__animated animate__fadeIn">
            <div className="w-full max-w-md p-8 transition duration-500 transform bg-gray-800 rounded-lg shadow-2xl hover:scale-105">
                <h2 className="mb-6 text-2xl font-bold text-center text-white animate__animated animate__fadeInDown">
                    Login
                </h2>
                <form onSubmit={submitHandler}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-gray-400">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="w-full p-3 text-white transition duration-300 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-gray-400">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="w-full p-3 text-white transition duration-300 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 animate__animated animate__fadeInUp"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400 animate__animated animate__fadeIn">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login