import { useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Always clear token and user, then redirect to home page
    localStorage.removeItem('token');
    setUser(null);
    axios.get('/api/users/logout').catch(() => { });
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, setUser]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900">
      {/* Animated background shapes */}
      <AnimatePresence>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-10 blur-2xl"
            initial={{ scale: 0, opacity: 0, x: Math.random() * 800 - 400, y: Math.random() * 600 - 300 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.2, delay: i * 0.07 }}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        <motion.div
          className="p-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="relative w-24 h-24 mx-auto mb-8"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.div
              className="absolute w-full h-full border-4 border-blue-500 rounded-full opacity-20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-full h-full border-4 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ borderColor: 'rgba(59,130,246,1) transparent transparent transparent' }}
            />
          </motion.div>

          <motion.h2
            className="mb-6 text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Logging Out...
          </motion.h2>

          <motion.p
            className="text-lg text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Thank you for using ChatRaj
          </motion.p>

          <motion.div
            className="mt-8 text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p>Redirecting to login page...</p>
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
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