import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../context/user.context';
import 'animate.css';

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (user) {
      navigate('/categories', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsNavVisible(true);
        return;
      }
      setIsNavVisible(window.scrollY < lastScrollY);
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleTryChatRaj = () => {
    if (user) {
      navigate('/welcome-chatraj', { replace: true });
    } else {
      localStorage.setItem('fromTryChatRaj', 'true');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900">
      <motion.nav 
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isNavVisible ? 1 : 0,
          y: isNavVisible ? 0 : -100
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-transparent backdrop-blur-sm bg-gray-900/10"
      >
        <div className="flex items-center gap-2">
          <i className="text-3xl text-white ri-robot-2-line"></i>
          <span className="text-2xl font-bold text-white">ChatRaj</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/register"
            className="px-6 py-2 text-white transition-all rounded-full hover:bg-white/10"
          >
            Register
          </Link>
          <Link 
            to="/login"
            className="px-6 py-2 text-blue-500 transition-all bg-white rounded-full hover:bg-blue-50"
          >
            Login
          </Link>
          <button 
            onClick={handleTryChatRaj}
            className="px-6 py-2 text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700"
          >
            Try ChatRaj
          </button>
        </div>
      </motion.nav>

      <section className="flex flex-col items-center justify-center min-h-screen text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-6 text-5xl font-bold leading-tight text-white md:text-6xl"
        >
          Your Intelligent Software Engineering Assistant
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mb-8 text-xl text-gray-300"
        >
          Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.
        </motion.p>
      </section>

      <section className="px-8 py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-white">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-gray-800/50"
              >
                <i className={`text-4xl text-blue-500 ${feature.icon}`}></i>
                <h3 className="mt-4 mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-white">Why Choose ChatRaj</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-lg bg-gray-800/30"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10">
                  <i className={`text-2xl text-blue-400 ${benefit.icon}`}></i>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-white">Powered By</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center p-6 text-center rounded-lg bg-gray-700/50"
              >
                <i className={`text-4xl text-blue-400 ${tech.icon}`}></i>
                <span className="mt-2 text-white">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-white">Getting Started</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative p-6 rounded-lg bg-gray-800/30"
              >
                <div className="absolute top-0 left-0 w-16 h-16 -mt-8 -ml-8">
                  <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-blue-500 bg-gray-900 rounded-full">
                    {index + 1}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 bg-gradient-to-b from-gray-900 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mb-12 text-xl text-gray-300">
            Join thousands of developers who are already using ChatRaj to improve their coding workflow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryChatRaj}
              className="px-8 py-3 text-lg font-medium text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700"
            >
              Try ChatRaj Free
            </motion.button>
            <Link 
              to="/register"
              className="px-8 py-3 text-lg font-medium text-white transition-all rounded-full hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-8 py-12 text-center bg-gray-900">
        <p className="text-gray-400">© 2025 ChatRaj All rights reserved.</p>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: 'ri-robot-2-line',
    title: 'AI Code Assistant',
    description: 'Get intelligent code suggestions and solutions powered by advanced AI.'
  },
  {
    icon: 'ri-team-line',
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live chat and collaborative coding.'
  },
  {
    icon: 'ri-translate-2',
    title: 'Multi-language Support',
    description: 'Communicate in your preferred language with support for 6+ languages.'
  },
  {
    icon: 'ri-code-box-line',
    title: 'Code Execution',
    description: 'Run and test your code directly in the browser.'
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Privacy Focused',
    description: 'Your data is secure with local storage and customizable retention.'
  },
  {
    icon: 'ri-palette-line',
    title: 'Customizable UI',
    description: 'Personalize your experience with themes and display options.'
  }
];

const techStack = [
  { icon: 'ri-reactjs-line', name: 'React' },
  { icon: 'ri-nodejs-line', name: 'Node.js' },
  { icon: 'ri-database-2-line', name: 'MongoDB' },
  { icon: 'ri-terminal-box-line', name: 'Express' },
  { icon: 'ri-cloud-line', name: 'Socket.io' },
  { icon: 'ri-robot-2-line', name: 'AI Integration' },
  { icon: 'ri-code-s-slash-line', name: 'TypeScript' },
  { icon: 'ri-layout-line', name: 'Tailwind CSS' }
];

const benefits = [
  {
    icon: 'ri-rocket-line',
    title: 'Boost Productivity',
    description: 'Save hours of development time with AI-powered code suggestions and automated solutions.'
  },
  {
    icon: 'ri-code-box-line',
    title: 'Smart Code Analysis',
    description: 'Get instant feedback on your code with advanced static analysis and best practice suggestions.'
  },
  {
    icon: 'ri-group-line',
    title: 'Team Collaboration',
    description: 'Share code snippets and solutions seamlessly with your team members.'
  },
  {
    icon: 'ri-brain-line',
    title: 'Continuous Learning',
    description: 'Improve your coding skills with personalized recommendations and learning resources.'
  }
];

const steps = [
  {
    title: 'Create Account',
    description: 'Sign up for free and set up your personal development environment in seconds.'
  },
  {
    title: 'Start Coding',
    description: 'Begin writing code with real-time AI assistance and smart suggestions.'
  },
  {
    title: 'Collaborate & Grow',
    description: 'Share your work, get feedback, and improve your development skills.'
  }
];

export default Home;