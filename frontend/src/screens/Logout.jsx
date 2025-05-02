import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { motion } from 'framer-motion';
import axios from '../config/axios';
import 'animate.css';

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
        navigate('/', { replace: true });
    }, 4000);

    axios.get('/users/logout')
        .then(() => {
            localStorage.removeItem('token');
            setUser(null);
        })
        .catch((err) => {
            console.error(err);
        });

    return () => clearTimeout(timer);
  }, [navigate, setUser]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900">
      <div className="absolute inset-0 overflow-hidden">
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
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute w-full h-full border-4 border-blue-500 rounded-full opacity-20"></div>
            <div className="absolute w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-3xl font-bold text-white"
          >
            Logging Out...
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300"
          >
            Thank you for using ChatRaj
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-gray-400"
          >
            <p>Redirecting to login page...</p>
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Logout;