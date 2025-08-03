import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm.jsx';
import UserLeaderboard from '../components/UserLeaderboard.jsx';
import ProjectShowcase from '../components/ProjectShowcase.jsx';
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

const useCases = [
  {
    icon: 'ri-lightbulb-flash-line',
    title: 'Learning & Experimentation',
    description: 'Practice coding, learn new languages, and experiment with AI-powered suggestions.'
  },
  {
    icon: 'ri-group-line',
    title: 'Team Projects',
    description: 'Collaborate with your team on real-world projects in real time.'
  },
  {
    icon: 'ri-terminal-window-line',
    title: 'Interview Preparation',
    description: 'Sharpen your coding skills and prepare for interviews with instant feedback.'
  }
];

const benefits = [
  {
    icon: 'ri-flashlight-line',
    title: 'Lightning Fast',
    description: 'Experience instant code suggestions and real-time collaboration.'
  },
  {
    icon: 'ri-lock-2-line',
    title: 'Secure & Private',
    description: 'Your code and data are encrypted and never shared without your consent.'
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

const techStack = [
  { icon: 'ri-reactjs-line', name: 'React' },
  { icon: 'ri-nodejs-line', name: 'Node.js' },
  { icon: 'ri-javascript-line', name: 'JavaScript' },
  { icon: 'ri-database-2-line', name: 'MongoDB' },
  { icon: 'ri-git-merge-line', name: 'Socket.io' },
  { icon: 'ri-brain-line', name: 'Google GenAI' },
  { icon: 'ri-css3-line', name: 'Tailwind CSS' },
  { icon: 'ri-github-fill', name: 'GitHub' }
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
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFabMenu, setShowFabMenu] = useState(false);

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
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-600 transition-colors rounded-lg hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="relative flex flex-col items-center justify-center min-h-screen text-center">
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
        {/* Animated code snippet card with hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="max-w-2xl p-6 mx-auto mt-16 transition-all duration-300 border shadow-xl rounded-xl bg-gray-900/80 border-blue-900/30 group hover:scale-105 hover:shadow-2xl hover:border-blue-400 hover:bg-gray-800"
        >
          <pre className={`font-mono text-base leading-relaxed text-left ${isDarkMode ? 'text-blue-200' : 'text-black'}`}>
{`// AI-powered code suggestion
function greet(name) {
  return \`Hello, \${name} 👋\`;
}

// Real-time collaboration enabled!
`}
          </pre>
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
            <div className="flex flex-col items-center w-full max-w-6xl gap-12 mx-auto md:flex-row">
              <div className="flex-1 min-w-0">
                <ol className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full">1</div>
                    <span>Register or log in to your account.</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full">2</div>
                    <span>Create or join a project and invite your team.</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full">3</div>
                    <span>Start coding with AI-powered suggestions and real-time chat.</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full">4</div>
                    <span>Run, test, and review code collaboratively.</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold text-white bg-blue-600 rounded-full">5</div>
                    <span>Export, share, and manage your projects securely.</span>
                  </li>
                </ol>
              </div>
              <div className="flex items-center justify-center flex-1 min-w-0">
                {/* 3D-like SVG illustration */}
                <svg className="w-full h-auto max-w-xs" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="160" cy="200" rx="120" ry="18" fill="#e0e7ff" opacity="0.5"/>
                  <rect x="60" y="40" width="200" height="120" rx="20" fill="#4f46e5" stroke="#60a5fa" strokeWidth="3"/>
                  <rect x="90" y="70" width="140" height="60" rx="12" fill="#312e81" stroke="#818cf8" strokeWidth="2"/>
                  <rect x="120" y="90" width="80" height="20" rx="6" fill="#38bdf8" opacity="0.7"/>
                  <circle cx="100" cy="60" r="8" fill="#38bdf8"/>
                  <circle cx="220" cy="60" r="8" fill="#818cf8"/>
                  <circle cx="160" cy="170" r="12" fill="#f472b6"/>
                  <rect x="140" y="120" width="40" height="10" rx="3" fill="#fbbf24" opacity="0.7"/>
                  <rect x="110" y="110" width="100" height="6" rx="2" fill="#94a3b8" opacity="0.5"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Popular Use Cases</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-700"
                >
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-blue-600 rounded-full">
                    <i className={`text-3xl ${useCase.icon}`}></i>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{useCase.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Why Choose ChatRaj</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 p-6 bg-white rounded-lg shadow-md dark:bg-gray-700"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-white bg-blue-600 rounded-full">
                    <i className={`text-2xl ${benefit.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Powered By</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-700"
                >
                  <i className={`text-4xl text-blue-600 ${tech.icon}`}></i>
                  <span className="mt-2 text-gray-800 dark:text-white">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Project Showcase</h2>
            <ProjectShowcase />
          </div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">User Leaderboard</h2>
            <UserLeaderboard />
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
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-8 text-3xl font-bold text-gray-800 dark:text-white">Security & Community</h2>
            <p className="mb-6 text-xl text-gray-600 dark:text-gray-300">
              Your privacy and security are our top priorities. ChatRaj uses secure authentication, encrypted data storage, and gives you full control over your data retention.
            </p>
            <p className="mb-12 text-xl text-gray-600 dark:text-gray-300">
              Join our growing developer community, contribute, and get support on GitHub.
            </p>
          </div>
        </section>

        <section className="py-20 bg-gray-100 dark:bg-gray-800">
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

      {/* Floating Action Button (Rocket) */}
      <div className="fixed z-50 bottom-8 right-8">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFabMenu((v) => !v)}
            className="flex items-center justify-center w-12 h-12 text-2xl text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
            aria-label="Quick Actions"
          >
            <i className="ri-rocket-2-line"></i>
          </motion.button>
          <AnimatePresence>
            {showFabMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute right-0 flex flex-col w-48 gap-2 p-4 bg-white rounded-lg shadow-xl bottom-14"
              >
                <button
                  onClick={() => {
                    setShowFabMenu(false);
                    handleTryChatRaj();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 transition rounded hover:bg-blue-50"
                >
                  <i className="ri-chat-3-line"></i> Try ChatRaj
                </button>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 transition rounded hover:bg-blue-50"
                  onClick={() => setShowFabMenu(false)}
                >
                  <i className="ri-user-add-line"></i> Create Account
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 transition rounded hover:bg-blue-50"
                  onClick={() => setShowFabMenu(false)}
                >
                  <i className="ri-login-box-line"></i> Login
                </Link>
                <a
                  href="https://github.com/Abhirajgautam28/Chatraj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 transition rounded hover:bg-blue-50"
                  onClick={() => setShowFabMenu(false)}
                >
                  <i className="ri-github-fill"></i> GitHub
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Home;