import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../context/user.context';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm.jsx';
import 'animate.css';

// Newsletter API endpoint for subscription
const NEWSLETTER_API_URL =
  import.meta.env.VITE_NEWSLETTER_API_URL ||
  'https://chatraj-backend.onrender.com/api/newsletter/subscribe';

// 9 Key Features for a balanced grid
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
    icon: 'ri-lightbulb-flash-line',
    title: 'Smart Suggestions',
    description: 'Receive context-aware tips, bug fixes, and code improvements instantly.'
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
  },
  {
    icon: 'ri-settings-3-line',
    title: 'Highly Customizable',
    description: 'Adjust themes, layouts, and features to fit your workflow.'
  },
  {
    icon: 'ri-customer-service-2-line',
    title: '24/7 Support',
    description: 'Get help anytime from our community and support team.'
  }
];


const faqs = [
  {
    q: "Is my code and data secure?",
    a: "Yes! ChatRaj uses secure authentication, encrypted storage, and gives you full control over your data retention."
  },
  {
    q: "Can I use ChatRaj for free?",
    a: "Absolutely! You can get started for free and upgrade as your needs grow."
  },
  {
    q: "Does ChatRaj support multiple programming languages?",
    a: "Yes, you can code and collaborate in multiple languages with AI-powered assistance."
  }
];

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useState(false);

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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <i className="text-3xl text-blue-600 ri-robot-2-line"></i>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">ChatRaj</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Login
          </Link>
          <button
            onClick={handleTryChatRaj}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
          >
            Try ChatRaj
          </button>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-4 text-4xl font-extrabold leading-tight text-gray-800 md:text-5xl dark:text-white"
          >
            Your Intelligent Software Engineering Assistant
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300"
          >
            Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={handleTryChatRaj}
              className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
            >
              Try ChatRaj Free
            </button>
            <Link
              to="/register"
              className="px-6 py-3 font-medium text-blue-600 transition-colors rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-800"
            >
              Create Account
            </Link>
          </motion.div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Key Features</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-700"
                >
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-blue-600 rounded-full">
                    <i className={`text-3xl ${feature.icon}`}></i>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">How It Works</h2>
            <div className="relative">
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex flex-col gap-12">
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full flex-center">1</div>
                  <div className="flex-grow p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Register or log in to your account.</h3>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full flex-center">2</div>
                  <div className="flex-grow p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Create or join a project and invite your team.</h3>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full flex-center">3</div>
                  <div className="flex-grow p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Start coding with AI-powered suggestions and real-time chat.</h3>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full flex-center">4</div>
                  <div className="flex-grow p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Run, test, and review code collaboratively.</h3>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full flex-center">5</div>
                  <div className="flex-grow p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Export, share, and manage your projects securely.</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-700">
                  <summary className="font-semibold text-gray-800 cursor-pointer dark:text-white">{faq.q}</summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">Stay Updated</h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              Subscribe to our newsletter for the latest features and updates.
            </p>
            <NewsletterSubscribeForm apiUrl={NEWSLETTER_API_URL} />
          </div>
        </section>
      </main>

      <footer className="py-6 text-center bg-gray-200 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">© 2025 ChatRaj All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;