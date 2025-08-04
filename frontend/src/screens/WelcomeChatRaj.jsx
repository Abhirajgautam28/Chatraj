import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { motion } from 'framer-motion';

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
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="relative flex items-center justify-center w-32 h-32 mb-12"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(62, 87, 229, 0.1), rgba(101, 76, 255, 0.1))',
                  boxShadow: 'inset 0 0 20px rgba(62, 87, 229, 0.2)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.i 
                className="text-5xl ri-robot-2-line"
                style={{
                  background: 'linear-gradient(135deg, #3E57E5 0%, #654CFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  filter: [
                    'drop-shadow(0 0 20px rgba(62, 87, 229, 0.4))',
                    'drop-shadow(0 0 40px rgba(62, 87, 229, 0.6))',
                    'drop-shadow(0 0 20px rgba(62, 87, 229, 0.4))'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            <motion.div className="text-center">
              <h1 className="mb-4 text-6xl font-bold tracking-tight">
                <span className="text-white">Welcome to </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E57E5] to-[#654CFF]">
                  ChatRaj
                </span>
              </h1>
              <motion.p
                className="text-xl font-light text-blue-200"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(62, 87, 229, 0.5)",
                    "0 0 40px rgba(62, 87, 229, 0.8)",
                    "0 0 20px rgba(62, 87, 229, 0.5)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Initializing Neural Interface
              </motion.p>
            </motion.div>
          </div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative h-2 mx-auto overflow-hidden rounded-full w-80 bg-blue-950">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3E57E5] via-[#654CFF] to-[#3E57E5]"
                style={{ 
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: '0%' }}
                animate={{
                  width: '100%',
                  backgroundPosition: ['0% 0%', '100% 0%'],
                }}
                transition={{
                  duration: 3.5,
                  ease: [0.19, 1, 0.22, 1],
                  backgroundPosition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              />
            </div>

            <div className="flex justify-center mt-8 space-x-12">
              {[
                'System Check',
                'Loading Models',
                'Initializing AI'
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.2 }}
                >
                  <motion.div
                    className="w-3 h-3 mb-3 rounded-full bg-[#3E57E5]"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                    style={{
                      boxShadow: '0 0 20px rgba(62, 87, 229, 0.5)',
                    }}
                  />
                  <span className="text-sm font-medium text-blue-200">
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeChatRaj;