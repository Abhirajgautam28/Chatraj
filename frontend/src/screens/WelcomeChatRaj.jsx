import React from 'react';
// ...existing code...
import { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const WelcomeChatRaj = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      navigate('/chat', { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F]">

      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(62, 87, 229, 0.15), transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div
          className="relative"
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="relative flex items-center justify-center w-32 h-32 mb-12"
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(62, 87, 229, 0.1), rgba(101, 76, 255, 0.1))',
                  boxShadow: 'inset 0 0 20px rgba(62, 87, 229, 0.2)',
                }}
              />
              <motion.i
                className="text-5xl ri-robot-2-line"
                style={{
                  background: 'linear-gradient(135deg, #3E57E5 0%, #654CFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
              />
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            >
              <h1 className="mb-4 text-6xl font-bold tracking-tight">
                <span className="text-white">Welcome to </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E57E5] to-[#654CFF]">
                  ChatRaj
                </span>
              </h1>
              <motion.p
                className="text-xl font-light text-blue-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
              >
                Initializing Neural Interface
              </motion.p>
            </motion.div>
          </div>

          <div
            className="mt-16"
          >
            <div className="relative h-2 mx-auto overflow-hidden rounded-full w-80 bg-blue-950">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3E57E5] via-[#654CFF] to-[#3E57E5]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.5, ease: 'easeInOut' }}
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>

            <div className="flex justify-center mt-8 space-x-12">
              {[
                'System Check',
                'Loading Models',
                'Initializing AI'
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-3 h-3 mb-3 rounded-full bg-[#3E57E5]"
                    style={{
                      boxShadow: '0 0 20px rgba(62, 87, 229, 0.5)',
                      animation: `pulse 1s infinite ${i * 0.3}s ease-in-out`
                    }}
                  />
                  <span className="text-sm font-medium text-blue-200">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChatRaj;