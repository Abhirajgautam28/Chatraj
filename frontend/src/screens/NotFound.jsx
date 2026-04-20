import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative inline-block mb-8">
           <i className="ri-robot-2-line text-9xl text-blue-600/20 dark:text-blue-400/10"></i>
           <span className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-blue-600 dark:text-blue-400">
             404
           </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <i className="ri-home-4-line text-xl"></i>
            Back to Home
          </motion.button>
        </Link>
      </motion.div>

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NotFound;
