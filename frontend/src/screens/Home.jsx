import { useState, useContext, useEffect, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/theme.context';
import { UserContext } from '../context/user.context';
import ThreeHero from '../components/ThreeHero';
import ThreeBackground from '../components/ThreeBackground';
import Blog from '../components/Blog';
import ContactUs from '../components/ContactUs';
import ProjectShowcase from '../components/ProjectShowcase';
import UserLeaderboard from '../components/UserLeaderboard';
import NewsletterSubscribeForm from '../components/NewsletterSubscribeForm';
import FAQSection from '../components/FAQSection';
import DarkModeToggle from '../components/DarkModeToggle';
import RocketFAB from '../components/RocketFAB';

const AskChatRajModal = lazy(() => import('../components/AskChatRajModal'));

const Home = () => {
  const { isDarkMode, toggleThemeGlobal } = useContext(ThemeContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [showAskChatRajModal, setShowAskChatRajModal] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  const NEWSLETTER_API_URL = "/api/newsletter/subscribe";

  const handleTryChatRaj = useCallback(() => {
    if (user) navigate('/chatraj');
    else navigate('/login');
  }, [user, navigate]);

  const faqs = [
    { q: "What is ChatRaj?", a: "ChatRaj is an AI-powered real-time collaboration platform for developers." },
    { q: "Is it free to use?", a: "Yes, we offer a generous free tier for individuals and small teams." },
    { q: "Can I collaborate with others?", a: "Absolutely! Real-time multi-user collaboration is at the core of ChatRaj." },
    { q: "How secure is my data?", a: "We use industry-standard encryption and security practices to protect your information." }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>

      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            if (toggleThemeGlobal) {
              toggleThemeGlobal(false, true);
            } else {
              // fallback if toggleThemeGlobal isn't ready
            }
          }}
          className={`p-2 transition-colors rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
        </button>
      </div>

      <ThreeBackground />

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
