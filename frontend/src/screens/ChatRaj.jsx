import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from '../context/theme.context';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterface from '../components/chat/ChatInterface';
import ChatSettings from '../components/chat/ChatSettings';
import { formatMessageTime, languages } from '../utils/chat.utils';

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
  const { isChatRajDarkMode, setIsChatRajDarkMode } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  const t = (key) => {
    const lang = settings.accessibility.language;
    return languages[lang]?.translations[key] || languages['en-US'].translations[key];
  };

  const speakResponse = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
      if (voiceInput) speakResponse(aiMessage.content);
    }, 1500);
  }, [inputMessage, speakResponse]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSubmit(null, transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [handleSubmit]);

  useEffect(() => {
    localStorage.setItem('chatrajSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isChatRajDarkMode);
  }, [isChatRajDarkMode]);

  useEffect(() => {
    try {
      if (settings.privacy.saveHistory) {
        if (messages.length > 0) localStorage.setItem('chatHistory', JSON.stringify(messages));
      } else {
        localStorage.removeItem('chatHistory');
      }
    } catch (e) { console.error(e); }
  }, [messages, settings.privacy.saveHistory]);

  useEffect(() => {
    if (settings.privacy.saveHistory) {
      try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) setMessages(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

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
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    if (settings.behavior.autoScroll && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.behavior.autoScroll]);

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const updateNestedSettings = (category, subCategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: { ...prev[category][subCategory], [key]: value }
      }
    }));
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const handlePrivacyToggle = () => {
    const newValue = !settings.privacy.saveHistory;
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, saveHistory: newValue }
    }));
    if (!newValue) {
      localStorage.removeItem('chatHistory');
      setMessages([]);
    }
  };

  return (
    <div className={isChatRajDarkMode ? 'dark' : 'light'}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className={`text-xl \${isSidebarOpen ? 'ri-menu-fold-line' : 'ri-menu-unfold-line'}`}></i>
            </button>
            <div className="flex items-center gap-3">
              <i className="text-2xl ri-robot-2-line" style={{ color: 'var(--robot-icon-color)' }}></i>
              <h1 className="text-xl font-semibold text-black dark:text-white whitespace-nowrap">ChatRaj</h1>
            </div>
          </div>
        </div>

        <ChatSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          settings={settings}
          user={user}
          navigate={navigate}
          handleNewChat={handleNewChat}
          t={t}
        />

        <div 
          className="flex flex-col flex-1 pt-16 transition-all duration-300"
          style={{ 
            marginLeft: isSidebarOpen ? settings.sidebar.width : '0',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <ChatInterface
            messages={messages}
            searchTerm={searchTerm}
            isThinking={isThinking}
            t={t}
            settings={settings}
            messageEndRef={messageEndRef}
            formatMessageTime={formatMessageTime}
          />

          <div className="p-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="relative max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message ChatRaj..."
                  className="w-full px-4 py-3 pl-4 pr-24 text-black bg-gray-100 border-0 dark:text-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute flex items-center gap-2 -translate-y-1/2 right-2 top-1/2">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2 transition-colors rounded-lg \${isListening ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    <i className={`text-xl \${isListening ? 'ri-mic-fill' : 'ri-mic-line'}`}></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowSearch(!showSearch)} 
                    className="p-2 text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <i className="text-xl ri-search-eye-fill"></i>
                  </button>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="p-2 text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="text-xl ri-send-plane-line"></i>
                  </button>
                </div>
              </form>

              {showSearch && (
                <div className="absolute right-0 z-50 w-64 mb-2 bottom-full">
                  <div className="mb-2 bg-white border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 p-2">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 text-sm bg-gray-100 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-center text-black dark:text-white">{t('disclaimer')}</p>
            </div>
          </div>
        </div>
      </div>

      <ChatSettings
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        settings={settings}
        updateSettings={updateSettings}
        updateNestedSettings={updateNestedSettings}
        isChatRajDarkMode={isChatRajDarkMode}
        setIsChatRajDarkMode={setIsChatRajDarkMode}
        languages={languages}
        clearChatHistory={clearChatHistory}
        handlePrivacyToggle={handlePrivacyToggle}
        t={t}
      />
    </div>
  );
};

export default ChatRaj;
