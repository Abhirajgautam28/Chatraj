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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSettingsTab, setActiveSettingsTab] = useState('display');
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('chatrajSettings');
    const defaultSettings = {
      display: {
        darkMode: false,
        theme: {
          primary: '#3B82F6', // Default blue color
          secondary: '#1F2937',
          accent: '#10B981',
          customColors: false
        },
        typography: {
          fontFamily: 'font-sans',
          userMessageSize: 'text-sm',
          aiMessageSize: 'text-sm',
          headerSize: 'text-xl'
        },
        animations: {
          messageTransition: true,
          interfaceTransitions: true
        }
      },
      behavior: {
        enterToSend: true,
        autoScroll: true,
        animations: {
          messageTransition: true,
          interfaceTransitions: true,
          loadingAnimations: true
        }
      },
      accessibility: {
        language: 'en-US',
        fontSize: 'medium',
        reducedMotion: false,
        screenReader: false
      },
      sidebar: {
        defaultOpen: true,
        width: '260px',
        showUserInfo: true,
        autoExpand: false,
        showTimestamps: true,
        pinnedChats: true,
        showNotifications: true,
        compactView: false,
        sortOrder: 'newest',
        groupByDate: true
      }
    };

    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });
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

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && isSidebarOpen) {
      sidebar.style.width = settings.sidebar.width;
    }
  }, [settings.sidebar.width, isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('chatrajSettings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window && recognitionRef.current) {
      recognitionRef.current.lang = settings.accessibility.language;
    }
  }, [settings.accessibility.language]);

  // Add this useEffect to apply theme colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.display.theme.primary);
    root.style.setProperty('--accent-color', settings.display.theme.accent);
  }, [settings.display.theme]);

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
    e?.preventDefault();
    
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
    if (settings.behavior.autoScroll && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.behavior.autoScroll]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (settings.behavior.enterToSend) {
        handleSubmit(e);
      }
    }
  };

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateNestedSettings = (category, subCategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [key]: value
        }
      }
    }));
  };

  return (
    <div className={settings.display.darkMode ? 'dark' : 'light'}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className={`text-xl ${isSidebarOpen ? 'ri-menu-fold-line' : 'ri-menu-unfold-line'}`}></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <i className="text-2xl text-blue-500 ri-robot-2-line"></i>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full"></span>
              </div>
              <h1 className="text-xl font-semibold text-black dark:text-white whitespace-nowrap">
                ChatRaj
              </h1>
            </div>
          </div>
        </div>
        <div
          className={`sidebar fixed left-0 h-full z-10 transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
          style={{ 
            width: isSidebarOpen ? settings.sidebar.width : '0px'
          }}
          onMouseEnter={() => settings.sidebar.autoExpand && !isSidebarOpen && setIsSidebarOpen(true)}
          onMouseLeave={() => settings.sidebar.autoExpand && setIsSidebarOpen(false)}
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
              {settings.sidebar.showUserInfo && (
                <div className="flex items-center gap-3 p-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 text-sm text-white bg-blue-500 rounded-full">
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                    {user?.email}
                  </span>
                </div>
              )}

              <button
                onClick={() => navigate('/categories')}
                className="flex items-center w-full gap-3 p-2 mb-2 text-black transition-colors rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="ri-arrow-go-back-fill"></i>
                <span className="text-sm font-medium">Categories</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center w-full gap-3 p-2 mb-2 text-black transition-colors rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="text-xl ri-settings-3-line"></i>
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>

        <div 
          className="flex flex-col flex-1 pt-16 transition-all duration-300"
          style={{ 
            marginLeft: isSidebarOpen ? settings.sidebar.width : '0',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="relative max-w-3xl px-4 py-6 mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <i className="text-6xl text-blue-500 ri-robot-2-line"></i>
                  <h1 className="text-2xl font-semibold text-black dark:text-white">
                    How can I help you today?
                  </h1>
                  <p className="text-sm text-black dark:text-white">
                    Ask me anything about programming, development, or tech in general.
                  </p>
                </div>
              ) : (
                (searchTerm 
                  ? messages.filter(message => 
                      message.content.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : messages
                ).map((message, index) => (
                  <motion.div
                    key={index}
                    initial={settings.behavior.animations.messageTransition ? { 
                      opacity: 0, 
                      x: message.type === 'user' ? 20 : -20 
                    } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 ${settings.display.chatBubbles.roundness} ${
                      message.type === 'user' 
                        ? 'text-white' 
                        : 'text-black dark:text-white'
                    }`}
                    style={{
                      backgroundColor: message.type === 'user' ? 'var(--primary-color)' : 'var(--secondary-bg-color)',
                    }}
                    >
                      <p className={`${settings.display.typography.fontFamily} ${
                        message.type === 'user' 
                          ? settings.display.typography.userMessageSize
                          : settings.display.typography.aiMessageSize
                      }`}>
                        {message.content}
                      </p>
                      {settings.sidebar.showTimestamps && (
                        <p className="mt-1 text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-black dark:text-white">
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
            <div className="relative max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message ChatRaj..."
                  className="w-full px-4 py-3 pl-4 pr-24 text-black placeholder-gray-500 bg-gray-100 border-0 dark:text-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
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
                    type="button"
                    onClick={() => setShowSearch(!showSearch)} 
                    className="p-2 text-gray-600 rounded-lg dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <i className="text-xl ri-search-eye-fill"></i>
                  </button>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="p-2 text-gray-600 rounded-lg dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="text-xl ri-send-plane-line"></i>
                  </button>
                </div>
              </form>

              {showSearch && (
                <div className="absolute right-0 z-50 w-64 mb-2 bottom-full">
                  <div className="mb-2 bg-white border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="relative p-2">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full p-2 text-sm text-gray-800 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                      <button 
                        onClick={() => {
                          setShowSearch(false);
                          setSearchTerm('');
                        }} 
                        className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <i className="text-xl ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-center text-black dark:text-white">
                ChatRaj can make mistakes. Please recheck important information manually.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <div 
              className="fixed inset-0 z-50 bg-black bg-opacity-50"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed bottom-24 left-4 z-50 w-[320px] bg-white rounded-lg shadow-xl dark:bg-gray-800"
              style={{ 
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'hidden'
              }}
            >
              {/* Settings Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <i className="text-xl ri-close-line"></i>
                </button>
              </div>

              {/* Settings Tabs */}
              <div className="p-4 border-b dark:border-gray-700">
                <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-700">
                  {['display', 'behavior', 'accessibility', 'sidebar'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSettingsTab(tab)}
                      className={`py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSettingsTab === tab 
                          ? 'bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-blue-400'
                          : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Display Settings */}
                  {activeSettingsTab === 'display' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Dark Mode</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                        </div>
                        <button
                          onClick={() => updateSettings('display', 'darkMode', !settings.display.darkMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.display.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.display.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-black dark:text-white">Theme Colors</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Primary Color</label>
                            <input
                              type="color"
                              value={settings.display.theme.primary}
                              onChange={(e) => updateNestedSettings('display', 'theme', 'primary', e.target.value)}
                              className="w-full h-10 mt-1 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Behavior Settings */}
                  {activeSettingsTab === 'behavior' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Enter to Send</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Use Enter key to send messages</p>
                        </div>
                        <button
                          onClick={() => updateSettings('behavior', 'enterToSend', !settings.behavior.enterToSend)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.behavior.enterToSend ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.behavior.enterToSend ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accessibility Settings */}
                  {activeSettingsTab === 'accessibility' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">Language</label>
                        <select
                          value={settings.accessibility.language}
                          onChange={(e) => updateSettings('accessibility', 'language', e.target.value)}
                          className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Sidebar Settings */}
                  {activeSettingsTab === 'sidebar' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">Sidebar Width</label>
                        <select
                          value={settings.sidebar.width}
                          onChange={(e) => updateSettings('sidebar', 'width', e.target.value)}
                          className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          <option value="220px">Narrow</option>
                          <option value="260px">Default</option>
                          <option value="300px">Wide</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Auto Expand on Hover</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Automatically expand sidebar when hovering</p>
                        </div>
                        <button
                          onClick={() => updateSettings('sidebar', 'autoExpand', !settings.sidebar.autoExpand)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.sidebar.autoExpand ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.sidebar.autoExpand ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Show Timestamps</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Display message timestamps</p>
                        </div>
                        <button
                          onClick={() => updateSettings('sidebar', 'showTimestamps', !settings.sidebar.showTimestamps)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.sidebar.showTimestamps ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.sidebar.showTimestamps ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatRaj;