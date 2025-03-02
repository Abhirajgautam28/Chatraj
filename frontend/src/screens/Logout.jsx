import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import 'animate.css';

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.get('/users/logout')
      .then(() => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen transition-opacity duration-300 ease-out opacity-100 bg-gradient-to-r from-blue-800 to-gray-900">
      <div className="w-full max-w-md p-6 transition duration-300 transform bg-gray-800 rounded-lg shadow-md hover:scale-105">
        <h2 className="mb-4 text-2xl font-bold text-center text-white">
          You are logged out.
        </h2>
        <p className="text-center text-white">
          Please login again.
        </p>
      </div>
    </div>
  );
};

export default Logout;