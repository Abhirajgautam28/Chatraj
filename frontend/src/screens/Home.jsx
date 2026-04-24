import React from 'react';
import TextType from '../components/TextType.jsx';
import ProjectShowcase from '../components/ProjectShowcase.jsx';
import UserLeaderboard from '../components/UserLeaderboard.jsx';
import { useContext, useEffect, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { ThemeContext } from '../context/theme.context';
import ThreeHero from '../components/ThreeHero';
import ThreeBackground from '../components/ThreeBackground';
import Blog from '../components/Blog';
import ContactUs from '../components/ContactUs';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm';
import FAQSection from '../components/FAQSection';
import RocketFAB from '../components/RocketFAB';

const AskChatRajModal = lazy(() => import('../components/AskChatRajModal'));

const Home = () => {
  const { isDarkMode, toggleThemeGlobal } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [showAskChatRajModal, setShowAskChatRajModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const NEWSLETTER_API_URL = "/api/newsletter/subscribe";
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  const handleThemeToggle = () => {
    if (toggleThemeGlobal) {
      toggleThemeGlobal(shouldReduceMotion, true);
    }
  };

  const AnimatedBg = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute bg-blue-700 rounded-full w-96 h-96 opacity-20 blur-3xl"
        initial={{ scale: 0, x: -200, y: -100 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ top: '-6rem', left: '-8rem' }}
      />
      <motion.div
        className="absolute bg-purple-600 rounded-full w-80 h-80 opacity-20 blur-3xl"
        initial={{ scale: 0, x: 200, y: 100 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        style={{ bottom: '-6rem', right: '-8rem' }}
      />
      <motion.div
        className="absolute bg-pink-500 rounded-full w-72 h-72 opacity-10 blur-2xl"
        initial={{ scale: 0, x: 0, y: 200 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{ bottom: '-8rem', left: '30%' }}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-transparent">
      <LiquidCursor />
      {typeof window !== "undefined" && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
        <AnimatedBg />
      )}

      {/* Navbar */}
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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-transparent backdrop-blur-sm ${isDarkMode ? 'bg-gray-900/10' : 'bg-white/80'}`}
      >
        <div className="flex items-center gap-2">
          <i className={`text-3xl ${isDarkMode ? 'text-white' : 'text-blue-600'} ri-robot-2-line`}></i>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ChatRaj</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/register"
            className={`px-6 py-2 transition-all rounded-full ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Register
          </Link>
          <Link
            to="/login"
            className={`px-6 py-2 transition-all rounded-full ${isDarkMode ? 'text-blue-500 bg-white hover:bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Login
          </Link>
          <button
            onClick={handleTryChatRaj}
            className="px-6 py-2 text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700"
          >
            Try ChatRaj
          </button>
          <button
            onClick={handleThemeToggle}
            className={`p-2 transition-colors rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
          >
            <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
          </button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <TextType
          text={["Your Intelligent Software Engineering Assistant"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
          className="text-4xl md:text-5xl font-bold text-center text-blue-900 dark:text-blue-200 block w-full mb-6"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`max-w-2xl mb-8 text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Streamline your development workflow with AI-powered code assistance, real-time collaboration, and intelligent project management.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <button
            onClick={handleTryChatRaj}
            className="px-8 py-3 text-lg font-medium text-white transition-all bg-blue-600 rounded-full shadow-lg hover:bg-blue-700"
          >
            Try ChatRaj Free
          </button>
          <Link
            to="/register"
            className={`px-8 py-3 text-lg font-medium transition-all rounded-full ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-blue-600 hover:bg-blue-100'}`}
          >
            Create Account
          </Link>
        </motion.div>
        {/* Animated code snippet card with hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className={`max-w-2xl p-6 mx-auto mt-16 transition-all duration-300 border shadow-xl rounded-xl group hover:scale-105 hover:shadow-2xl hover:border-blue-400 ${isDarkMode ? 'bg-gray-900/80 border-blue-900/30 hover:bg-gray-800' : 'bg-gray-50/80 border-blue-100 hover:bg-white/90'}`}
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

      <section className="relative z-10">
        <ThreeHero isDarkMode={isDarkMode} handleTryChatRaj={handleTryChatRaj} />
      </section>

      <section className="relative z-10 py-24 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <ProjectShowcase isDarkMode={isDarkMode} />
        </div>
      </section>

      <section className="relative z-10 py-24 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold">Real-time Collaboration, Redefined.</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Experience the power of AI-assisted development with teammates from around the globe.
                Build, test, and deploy faster than ever before.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-gray-800 flex items-center justify-center text-xs font-bold">
                      U{i}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold">Joined by 1,000+ developers</p>
                  <p className="text-gray-500">across 50+ countries</p>
                </div>
              </div>
            </motion.div>
            <UserLeaderboard isDarkMode={isDarkMode} />
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} isDarkMode={isDarkMode} />

      <section className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-4">Latest from Blog</h2>
              <p className="text-gray-400">Insights, updates, and stories from the ChatRaj team.</p>
            </div>
            <Link to="/blogs" className="text-blue-500 font-medium hover:underline flex items-center gap-2">
              View all posts <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <Blog user={user} />
        </div>
      </section>

      <section className="relative z-10">
        <ContactUs />
      </section>

      <section className={`relative z-10 py-24 px-4 ${isDarkMode ? 'bg-blue-900/10' : 'bg-gray-50/50'} backdrop-blur-3xl`}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-blue-500">
            <i className="ri-mail-send-line text-3xl"></i>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Join the Newsletter</h2>
            <p className="text-xl text-gray-400">
              Get the latest updates on new features and community projects.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <NewsletterSubscribeForm apiUrl={NEWSLETTER_API_URL} />
          </div>
        </div>
      </section>

      <footer className={`relative z-10 py-12 border-t ${isDarkMode ? 'border-gray-800 bg-black/50' : 'border-gray-100 bg-white/50'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-robot-2-line text-white"></i>
            </div>
            <span className="text-xl font-bold">ChatRaj</span>
          </div>
          <p className="text-gray-500 text-sm italic">© 2026 ChatRaj • Built for the future of development.</p>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-blue-500 transition-colors"><i className="ri-twitter-x-fill text-xl"></i></a>
            <a href="#" className="hover:text-blue-500 transition-colors"><i className="ri-github-fill text-xl"></i></a>
            <a href="#" className="hover:text-blue-500 transition-colors"><i className="ri-discord-fill text-xl"></i></a>
          </div>
        </div>
      </footer>

      <RocketFAB
        showFabMenu={showFabMenu}
        setShowFabMenu={setShowFabMenu}
        handleTryChatRaj={handleTryChatRaj}
        setShowAskChatRajModal={setShowAskChatRajModal}
      />

      <Suspense fallback={null}>
        {showAskChatRajModal && (
          <AskChatRajModal
            isOpen={showAskChatRajModal}
            onRequestClose={() => setShowAskChatRajModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Home;
