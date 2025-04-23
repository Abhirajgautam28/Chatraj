import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'animate.css';
import { ChatRajThemeContext } from '../context/chatraj-theme.context';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';

const WaveAnimation = ({ isListening }) => {
  return (
    <motion.div 
      className={`absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden transition-all duration-300 ${
        isListening ? 'h-32' : 'h-0'
      }`}
    >
      <div className="relative w-full">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 right-0 h-full"
            style={{
              background: `rgba(59, 130, 246, ${0.2 - i * 0.05})`,
              backgroundImage: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.2))',
            }}
            animate={{
              y: [0, -10, 0],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const VoiceVisualization = ({ isListening }) => {
  return (
    <motion.div 
      className={`absolute left-0 right-0 flex items-center justify-center ${
        isListening ? 'bottom-20' : 'bottom-0'
      } transition-all duration-300`}
    >
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-blue-400"
            animate={{
              height: isListening ? [20, 40, 20] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const VoiceIndicator = ({ isListening }) => {
  return (
    <motion.div 
      className={`absolute -top-16 left-0 flex items-center justify-center p-3 space-x-2 text-sm text-white bg-black rounded-lg ${
        isListening ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-200`}
    >
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span>Listening...</span>
    </motion.div>
  );
};

const ChatRaj = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { isDarkMode, setIsDarkMode } = useContext(ChatRajThemeContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSubmit({ preventDefault: () => {} }, transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Victoria') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Tessa')
        );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
          utterance.pitch = 1.2;
          utterance.rate = 0.9;
        }
      };

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e, voiceInput = null) => {
    e.preventDefault();
    const messageToSend = voiceInput || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    setTimeout(() => {
      const response = "I understand and I'm here to help you! 🌟";
      const aiMessage = {
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);

      if (voiceInput) {
        speakResponse(response);
      }
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
    setIsThinking(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className={`text-xl ${isSidebarOpen ? 'ri-menu-fold-line' : 'ri-menu-unfold-line'}`}></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <i className="text-2xl text-blue-500 ri-robot-2-line"></i>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full"></span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">ChatRaj</h1>
            </div>
          </div>
        </div>
        <div
          className={`${
            isSidebarOpen ? 'w-[260px]' : 'w-0'
          } fixed left-0 h-full z-10 transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
        >
          <div className="flex flex-col h-full pt-16"> 
            <div className="p-4">
              <button 
                onClick={handleNewChat}
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <i className="text-lg ri-add-line"></i>
                New Chat
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 text-sm text-white bg-blue-500 rounded-full">
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                  {user?.email}
                </span>
              </div>

              <button
                onClick={() => navigate('/categories')}
                className="flex items-center w-full gap-3 p-2 mb-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="ri-arrow-go-back-fill"></i>
                <span className="text-sm font-medium">Categories</span>
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center w-full gap-3 p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
                <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col flex-1 pt-16 transition-all duration-300"
          style={{ marginLeft: isSidebarOpen ? '260px' : '0' }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl px-4 py-6 mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <i className="text-6xl text-blue-500 ri-robot-2-line"></i>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    How can I help you today?
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask me anything about programming, development, or tech in general.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-current rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message ChatRaj..."
                  className="w-full px-4 py-3 pl-4 pr-24 text-gray-800 placeholder-gray-400 bg-gray-100 border-0 rounded-xl dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <div className="absolute flex items-center gap-2 -translate-y-1/2 right-2 top-1/2">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2 transition-colors rounded-lg ${
                      isListening 
                        ? 'text-red-500' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <i className={`text-xl ${isListening ? 'ri-mic-fill' : 'ri-mic-line'}`}></i>
                  </button>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="p-2 text-gray-500 transition-colors rounded-lg hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="text-xl ri-send-plane-line"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-30 flex items-center gap-2 px-4 py-2 text-sm text-white transform -translate-x-1/2 bg-black rounded-lg bottom-24 left-1/2"
          >
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <span>Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatRaj;