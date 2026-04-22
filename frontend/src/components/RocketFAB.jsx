import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const RocketFAB = ({ showFabMenu, setShowFabMenu, handleTryChatRaj, setShowAskChatRajModal }) => {
  return (
    <div className="fixed z-50 bottom-8 right-8">
      <div className="relative flex items-end justify-end" style={{ minHeight: 120, minWidth: 120 }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowFabMenu((v) => !v)}
          className="flex items-center justify-center w-14 h-14 text-2xl text-white bg-blue-600 rounded-full shadow-2xl hover:bg-blue-700 focus:outline-none overflow-hidden group"
          aria-label="Quick Actions"
          style={{ zIndex: 2, position: 'relative' }}
        >
          <span style={{ display: 'inline-block', position: 'relative', width: 56, height: 56 }}>
            {/* Animated Stream Lines */}
            <motion.span
              style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', zIndex: 1 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0.2, 0.5, 0.2], y: [6, 0, 6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M6 0 Q5 10 6 20" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.span>

            <motion.i
              className="ri-rocket-2-line"
              style={{ display: 'inline-block', zIndex: 2, position: 'relative', top: '14px' }}
              animate={{ y: [0, 2, 0, -2, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.button>

        <AnimatePresence>
          {showFabMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              className="absolute right-0 flex flex-col w-56 gap-1 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl bottom-16 border border-gray-100 dark:border-gray-800"
            >
              {[
                { label: 'Try ChatRaj', icon: 'ri-chat-3-line', onClick: handleTryChatRaj },
                { label: 'Ask ChatRaj', icon: 'ri-question-answer-line', onClick: () => setShowAskChatRajModal(true) },
                { label: 'Create Account', icon: 'ri-user-add-line', link: '/register' },
                { label: 'Login', icon: 'ri-login-box-line', link: '/login' },
                { label: 'GitHub', icon: 'ri-github-fill', href: 'https://github.com/Abhirajgautam28/Chatraj' }
              ].map((item, idx) => (
                <div key={idx}>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
                      onClick={() => setShowFabMenu(false)}
                    >
                      <i className={`${item.icon} text-lg`}></i> {item.label}
                    </Link>
                  ) : item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
                      onClick={() => setShowFabMenu(false)}
                    >
                      <i className={`${item.icon} text-lg`}></i> {item.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setShowFabMenu(false);
                        item.onClick();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <i className={`${item.icon} text-lg`}></i> {item.label}
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

RocketFAB.propTypes = {
  showFabMenu: PropTypes.bool.isRequired,
  setShowFabMenu: PropTypes.func.isRequired,
  handleTryChatRaj: PropTypes.func.isRequired,
  setShowAskChatRajModal: PropTypes.func.isRequired,
};

export default RocketFAB;
