import { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../context/user.context';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';
import ChatRajSidebar from '../components/ChatRajSidebar';
import ChatRajSettingsModal from '../components/ChatRajSettingsModal';
import ChatRajMessage from '../components/ChatRajMessage';
import ConfirmationModal from '../components/ConfirmationModal';
import { CHATRAJ_TRANSLATIONS } from '../config/translations';
import { logger } from '../utils/logger';

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
  const { user } = useContext(UserContext);
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('display');

  const defaultSettings = useMemo(() => ({
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
      autoDelete: {
        enabled: false,
        days: 30
      }
    }
  }), []);

  const [settings, setSettings] = useLocalStorage('chatrajSettings', defaultSettings);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const t = (key) => {
    const lang = settings.accessibility.language;
    return CHATRAJ_TRANSLATIONS[lang]?.[key] || CHATRAJ_TRANSLATIONS['en-US'][key];
  };

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

      utterance.onstart = () => setIsSpeaking(true);
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

    try {
      const res = await axios.post("/api/ai", {
        prompt: messageToSend,
        userApiKey: user?.googleApiKey
      });
      const aiResponse = res.data?.response || "I understand and I'm here to help you! 🌟";

      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (voiceInput || settings.accessibility.textToSpeech) {
        speakResponse(aiMessage.content);
      }
    } catch (err) {
      const errorMessage = {
        type: 'ai',
        content: "I'm having trouble connecting to my brain right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast("AI Service Error", "error");
    } finally {
      setIsThinking(false);
    }
  }, [inputMessage, speakResponse, user?.googleApiKey, settings.accessibility.textToSpeech, showToast]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = settings.accessibility.language;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSubmit({ preventDefault: () => {} }, transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [handleSubmit, settings.accessibility.language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings.display.darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.display.theme.primary);
    root.style.setProperty('--primary-color-transparent', `${settings.display.theme.primary}80`);
  }, [settings.display.theme]);

  // Load History
  useEffect(() => {
    if (settings.privacy.saveHistory) {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed)) setMessages(parsed);
        } catch (e) {
          logger.error('History load error', e);
        }
      }
    }
  }, [settings.privacy.saveHistory]);

  // Save History
  useEffect(() => {
    if (settings.privacy.saveHistory && messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages, settings.privacy.saveHistory]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      showToast("Speech recognition not supported", "warning");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    showToast("Started a new conversation", "info");
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
    showToast("Chat history cleared", "success");
  };

  const handlePrivacyToggle = () => {
    const newValue = !settings.privacy.saveHistory;
    updateSettings('privacy', 'saveHistory', newValue);
    if (!newValue) {
      localStorage.removeItem('chatHistory');
      setMessages([]);
      showToast("History disabled and cleared", "info");
    } else {
      showToast("History enabled", "success");
    }
  };

  const languages = {
    'en-US': { name: 'English (US)' },
    'hi-IN': { name: 'Hindi (हिंदी)' },
    'es-ES': { name: 'Spanish (Español)' },
    'fr-FR': { name: 'French (Français)' },
    'de-DE': { name: 'German (Deutsch)' },
    'ja-JP': { name: 'Japanese (日本語)' }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <ChatRajSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        settings={settings}
        handleNewChat={handleNewChat}
        t={t}
        isDarkMode={settings.display.darkMode}
      />

      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : ''}`}>
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <i className="ri-menu-2-line text-xl"></i>
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {t('welcomeMessage')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <i className="ri-settings-3-line text-xl"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-20">
              <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-bounce">
                <i className="ri-robot-2-line text-white text-5xl"></i>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('welcomeMessage')}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t('welcomeSubtext')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  "Explain React Hooks in simple terms",
                  "Write a Python script for web scraping",
                  "How to center a div with Tailwind?",
                  "Give me creative ideas for a web project"
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputMessage(prompt);
                      handleSubmit({ preventDefault: () => {} }, prompt);
                    }}
                    className="p-4 text-sm text-left text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-500 transition-all shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <ChatRajMessage
                  key={index}
                  msg={msg}
                  settings={settings}
                  isDarkMode={settings.display.darkMode}
                  formatMessageTime={formatMessageTime}
                />
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3`}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{t('thinking')}</span>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>

        <footer className="p-4 md:p-6 bg-transparent sticky bottom-0">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end gap-2 bg-white dark:bg-gray-900 p-2 pl-4 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && settings.behavior.enterToSend) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 max-h-48 py-2.5 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white scrollbar-hide"
              />
              <div className="flex items-center gap-1">
                {settings.accessibility.speechToText && (
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2.5 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <i className="ri-mic-2-line text-xl"></i>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isThinking}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                  <i className="ri-send-plane-2-fill text-xl"></i>
                </button>
              </div>
            </form>
            <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
              {t('disclaimer')}
            </p>
          </div>
        </footer>

        <ChatRajSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          activeSettingsTab={activeSettingsTab}
          setActiveSettingsTab={setActiveSettingsTab}
          settings={settings}
          updateSettings={updateSettings}
          updateNestedSettings={updateNestedSettings}
          handlePrivacyToggle={handlePrivacyToggle}
          clearChatHistory={() => setIsConfirmClearOpen(true)}
          t={t}
          languages={languages}
        />

        <ConfirmationModal
          isOpen={isConfirmClearOpen}
          onClose={() => setIsConfirmClearOpen(false)}
          onConfirm={clearChatHistory}
          title={t('clearHistory')}
          message={t('historyClearConfirm')}
          confirmText="Clear History"
          type="danger"
        />
      </main>
    </div>
  );
};

export default ChatRaj;
