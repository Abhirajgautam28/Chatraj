import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChatRajThemeContext } from '../context/chatraj-theme.context';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  return `${dateString} ${timeString}`;
};

const ChatRaj = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [, setIsSpeaking] = useState(false);
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
          primary: '#3B82F6',
          secondary: '#1F2937',
          accent: '#10B981',
          customColors: false,
          messageColors: {
            user: '#3B82F6',
            ai: '#F3F4F6'
          }
        },
        typography: {
          fontFamily: 'font-sans',
          userMessageSize: 'text-sm',
          aiMessageSize: 'text-sm',
          headerSize: 'text-xl',
          fontWeight: 'normal'
        },
        chatBubbles: {
          roundness: 'rounded-lg',
          padding: 'normal',
          shadow: true
        },
        animations: {
          messageTransition: true,
          interfaceTransitions: true,
          intensity: 'medium'
        }
      },
      behavior: {
        enterToSend: true,
        autoScroll: true,
        autoSave: true,
        notifications: true,
        animations: {
          messageTransition: true,
          interfaceTransitions: true,
          loadingAnimations: true
        },
        autoComplete: true,
        spellCheck: true
      },
      accessibility: {
        language: 'en-US',
        fontSize: 'medium',
        reducedMotion: false,
        screenReader: false,
        contrastMode: 'normal',
        keyboardShortcuts: true,
        textToSpeech: true,
        speechToText: true
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
        groupByDate: true,
        showCategories: true
      },
      privacy: {
        saveHistory: true,
        clearOnExit: false,
        shareAnalytics: false,
        autoDelete: {
          enabled: false,
          days: 30
        }
      }
    };

    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  useContext(ChatRajThemeContext);
  const { user } = useContext(UserContext);

  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  const languages = {
    'en-US': {
      name: 'English (US)',
      translations: {
        settings: 'Settings',
        darkMode: 'Dark Mode',
        themeColors: 'Theme Colors',
        chatBubbles: 'Chat Bubbles',
        newChat: 'New Chat',
        sendMessage: 'Send Message',
        thinking: 'Thinking...',
        welcomeMessage: 'How can I help you today?',
        welcomeSubtext: 'Ask me anything about programming, development, or tech in general.',
        disclaimer: 'ChatRaj can make mistakes. Please recheck important information manually.'
      }
    },
    'hi-IN': {
      name: 'हिंदी (Hindi)',
      translations: {
        settings: 'सेटिंग्स',
        darkMode: 'डार्क मोड',
        themeColors: 'थीम रंग',
        chatBubbles: 'चैट बबल्स',
        newChat: 'नई चैट',
        sendMessage: 'संदेश भेजें',
        thinking: 'सोच रहा हूं...',
        welcomeMessage: 'मैं आपकी कैसे मदद कर सकता हूं?',
        welcomeSubtext: 'प्रोग्रामिंग, डेवलपमेंट या टेक से जुड़ा कोई भी सवाल पूछें।',
        disclaimer: 'ChatRaj से गलतियां हो सकती हैं। कृपया महत्वपूर्ण जानकारी की पुनः जांच करें।'
      }
    },
    'es-ES': {
      name: 'Español (Spanish)',
      translations: {
        settings: 'Ajustes',
        darkMode: 'Modo Oscuro',
        themeColors: 'Colores del Tema',
        chatBubbles: 'Burbujas de Chat',
        newChat: 'Nuevo Chat',
        sendMessage: 'Enviar Mensaje',
        thinking: 'Pensando...',
        welcomeMessage: '¿Cómo puedo ayudarte hoy?',
        welcomeSubtext: 'Pregúntame cualquier cosa sobre programación, desarrollo o tecnología.',
        disclaimer: 'ChatRaj puede cometer errores. Por favor, verifica la información importante.'
      }
    },
    'fr-FR': {
      name: 'Français (French)',
      translations: {
        settings: 'Paramètres',
        darkMode: 'Mode Sombre',
        themeColors: 'Couleurs du Thème',
        chatBubbles: 'Bulles de Chat',
        newChat: 'Nouvelle Discussion',
        sendMessage: 'Envoyer',
        thinking: 'Réflexion...',
        welcomeMessage: 'Comment puis-je vous aider aujourd\'hui?',
        welcomeSubtext: 'Posez-moi vos questions sur la programmation, le développement ou la technologie.',
        disclaimer: 'ChatRaj peut faire des erreurs. Veuillez revérifier les informations importantes.'
      }
    },
    'de-DE': {
      name: 'Deutsch (German)',
      translations: {
        settings: 'Einstellungen',
        darkMode: 'Dunkelmodus',
        themeColors: 'Designfarben',
        chatBubbles: 'Chatblasen',
        newChat: 'Neuer Chat',
        sendMessage: 'Nachricht senden',
        thinking: 'Denke nach...',
        welcomeMessage: 'Wie kann ich Ihnen heute helfen?',
        welcomeSubtext: 'Fragen Sie mich alles über Programmierung, Entwicklung oder Technologie.',
        disclaimer: 'ChatRaj kann Fehler machen. Bitte überprüfen Sie wichtige Informationen.'
      }
    },
    'ja-JP': {
      name: '日本語 (Japanese)',
      translations: {
        settings: '設定',
        darkMode: 'ダークモード',
        themeColors: 'テーマカラー',
        chatBubbles: 'チャットバブル',
        newChat: '新規チャット',
        sendMessage: '送信',
        thinking: '考え中...',
        welcomeMessage: '本日はどのようにお手伝いできますか？',
        welcomeSubtext: 'プログラミング、開発、技術に関する質問をお気軽にどうぞ。',
        disclaimer: 'ChatRajは間違える可能性があります。重要な情報は必ず確認してください。'
      }
    }
  };

  const t = (key) => {
    const lang = settings.accessibility.language;
    return languages[lang]?.translations[key] || languages['en-US'].translations[key];
  };

  // Duplicate speakResponse removed

  // Move speakResponse above handleSubmit to avoid ReferenceError
  const speakResponse = useCallback((text) => {
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
  }, [setIsSpeaking]);

  const handleSubmit = useCallback(async (e, voiceInput = null) => {
    e?.preventDefault();

    const messageToSend = voiceInput || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    setTimeout(() => {
      const aiMessage = {
        type: 'ai',
        content: "I understand and I'm here to help you! 🌟",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);

      if (voiceInput) {
        speakResponse(aiMessage.content);
      }
    }, 1500);
  }, [inputMessage, speakResponse]);
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
  }, [handleSubmit, inputMessage, speakResponse]);

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

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.display.theme.primary);
    root.style.setProperty('--button-bg-color', settings.display.theme.primary);
    root.style.setProperty('--robot-icon-color', settings.display.theme.primary);
    root.style.setProperty('--primary-color-transparent', `${settings.display.theme.primary}80`);
  }, [settings.display.theme]);

  useEffect(() => {
    try {
      if (settings.privacy.saveHistory) {
        if (messages.length > 0) {
          localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
      } else {
        localStorage.removeItem('chatHistory');
      }
    } catch (error) {
      console.error('Error handling chat history:', error);
    }
  }, [messages, settings.privacy.saveHistory]);

  useEffect(() => {
    if (settings.privacy.saveHistory) {
      try {
        const savedMessages = localStorage.getItem('chatHistory');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, [settings.privacy.saveHistory]);

  useEffect(() => {
    if (settings.privacy.autoDelete.enabled) {
      const deleteOldMessages = () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - settings.privacy.autoDelete.days);
        
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => {
            const messageDate = new Date(msg.timestamp);
            return messageDate > cutoffDate;
          });
          
          if (filteredMessages.length !== prev.length && settings.privacy.saveHistory) {
            console.log(`Deleted ${prev.length - filteredMessages.length} old messages`);
            localStorage.setItem('chatHistory', JSON.stringify(filteredMessages));
          }
          
          return filteredMessages;
        });
      };

      deleteOldMessages();

      const interval = setInterval(deleteOldMessages, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [settings.privacy.autoDelete.enabled, settings.privacy.autoDelete.days, settings.privacy.saveHistory]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
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
  const handleAutoComplete = (text) => {
    if (!settings.behavior.autoComplete) return;
    
    const commonPhrases = [
      "Can you help me with",
      "How do I",
      "What is",
      "Please explain",
      "Show me an example of",
    ];

    const matches = commonPhrases.filter(phrase => 
      phrase.toLowerCase().startsWith(text.toLowerCase())
    );
    
    setAutoCompleteOptions(matches);
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const handlePrivacyToggle = () => {
    const newValue = !settings.privacy.saveHistory;

    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        saveHistory: newValue
      }
    }));

    if (!newValue) {
      localStorage.removeItem('chatHistory');
      setMessages([]);
    } else if (newValue && messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
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
                <i className="text-2xl ri-robot-2-line" style={{ color: 'var(--robot-icon-color)' }}></i>
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
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--button-bg-color)' }}
              >
                <i className="text-lg ri-add-line"></i>
                {t('newChat')}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {settings.sidebar.showUserInfo && (
                <div className="flex items-center gap-3 p-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 text-sm text-white bg-blue-500 rounded-full">
                    {user?.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                    {user?.firstName}
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
                <span className="text-sm font-medium">{t('settings')}</span>
              </button>
              <button
                onClick={() => navigate('/blogs')}
                className="flex items-center w-full gap-3 p-2 mb-2 text-black transition-colors rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="ri-newspaper-line"></i>
                <span className="text-sm font-medium">Blogs</span>
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
                  <i className="text-6xl ri-robot-2-line" style={{ color: 'var(--robot-icon-color)' }}></i>
                  <h1 className="text-2xl font-semibold text-black dark:text-white">
                    {t('welcomeMessage')}
                  </h1>
                  <p className="text-sm text-black dark:text-white">
                    {t('welcomeSubtext')}
                  </p>
                </div>
              ) : (
                (searchTerm 
                  ? messages.filter(message => 
                      message.content.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : messages
                ).map((message, index) => (
                  <div
                    key={index}
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
                          {formatMessageTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-black dark:text-white">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-current rounded-full"
                      />
                    ))}
                  </div>
                  <span>{t('thinking')}</span>
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
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleAutoComplete(e.target.value);
                  }}
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
                        ? 'voice-animation speaking-indicator mic-active'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={isListening ? {
                      '--primary-color-transparent': `${settings.display.theme.primary}80`
                    } : {}}
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

              {settings.behavior.autoComplete && autoCompleteOptions.length > 0 && (
                <div className="absolute left-0 w-full mb-1 bg-white rounded-lg shadow-lg bottom-full dark:bg-gray-800">
                  {autoCompleteOptions.map((option, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setInputMessage(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

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
                {t('disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
          <>
            <div 
              className="fixed inset-0 z-50 bg-black bg-opacity-50"
              onClick={() => setIsSettingsOpen(false)}
            />
            <div
              className="fixed bottom-24 left-8 z-50 w-[480px] max-w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              style={{ 
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'hidden',
                transition: 'box-shadow 0.18s',
              }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <i className="text-2xl ri-close-line"></i>
                </button>
              </div>

              {/* Horizontal tab bar */}
              <div className="flex border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-700 px-7">
                {['display', 'behavior', 'accessibility', 'sidebar', 'privacy'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    className={`px-6 py-3 text-base font-semibold border-b-4 transition-colors duration-150 focus:outline-none ${
                      activeSettingsTab === tab 
                        ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400' 
                        : 'border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-transparent'
                    }`}
                    style={{ marginBottom: '-1px', borderRadius: '10px 10px 0 0' }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-7 space-y-7">
                  {activeSettingsTab === 'display' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">{t('darkMode')}</label>
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
                        <label className="text-sm font-medium text-black dark:text-white">{t('themeColors')}</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Primary Color</label>
                            <input
                              type="color"
                              value={settings.display.theme.primary}
                              onChange={(e) => {
                                updateNestedSettings('display', 'theme', 'primary', e.target.value);
                                const root = document.documentElement;
                                root.style.setProperty('--primary-color', e.target.value);
                                root.style.setProperty('--button-bg-color', e.target.value);
                                root.style.setProperty('--robot-icon-color', e.target.value);
                              }}
                              className="w-full h-10 mt-1 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-black dark:text-white">{t('chatBubbles')}</label>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Roundness</label>
                            <select
                              value={settings.display.chatBubbles.roundness}
                              onChange={(e) => updateNestedSettings('display', 'chatBubbles', 'roundness', e.target.value)}
                              className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                            >
                              <option value="rounded-sm">Minimal</option>
                              <option value="rounded-lg">Normal</option>
                              <option value="rounded-xl">Large</option>
                              <option value="rounded-3xl">Extra Large</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Message Font Size</label>
                            <select
                              value={settings.display.typography.userMessageSize}
                              onChange={(e) => updateNestedSettings('display', 'typography', 'userMessageSize', e.target.value)}
                              className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                            >
                              <option value="text-xs">Small</option>
                              <option value="text-sm">Medium</option>
                              <option value="text-base">Large</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Message Shadows</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Add shadows to message bubbles</p>
                        </div>
                        <button
                          onClick={() => updateNestedSettings('display', 'chatBubbles', 'shadow', !settings.display.chatBubbles.shadow)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.display.chatBubbles.shadow ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.display.chatBubbles.shadow ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}

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

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Auto Complete</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Enable message auto-completion</p>
                        </div>
                        <button
                          onClick={() => updateSettings('behavior', 'autoComplete', !settings.behavior.autoComplete)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.behavior.autoComplete ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.behavior.autoComplete ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'accessibility' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">Language</label>
                        <select
                          value={settings.accessibility.language}
                          onChange={(e) => updateSettings('accessibility', 'language', e.target.value)}
                          className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          {Object.entries(languages).map(([code, lang]) => (
                            <option key={code} value={code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

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

                  {activeSettingsTab === 'privacy' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Save Chat History</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Store conversations locally</p>
                        </div>
                        <button
                          onClick={handlePrivacyToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.privacy.saveHistory ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.privacy.saveHistory ? 'translate-x-6' : 'translate-x-1'
                            }`} 
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">Auto Delete Messages</label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Automatically delete old messages</p>
                        </div>
                        <button
                          onClick={() => updateNestedSettings('privacy', 'autoDelete', 'enabled', !settings.privacy.autoDelete.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.privacy.autoDelete.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy.autoDelete.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      {settings.privacy.autoDelete.enabled && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-black dark:text-white">Auto Delete After</label>
                          <select
                            value={settings.privacy.autoDelete.days}
                            onChange={(e) => updateNestedSettings('privacy', 'autoDelete', 'days', Number(e.target.value))}
                            className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                          >
                            <option value={7}>7 days</option>
                            <option value={30}>30 days</option>
                            <option value={90}>90 days</option>
                          </select>
                        </div>
                      )}

                      <div className="pt-4 border-t dark:border-gray-700">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                              clearChatHistory();
                            }
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                          Clear All Chat History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

ChatRaj.propTypes = {
    isListening: PropTypes.bool,
};

export default ChatRaj;