import { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { UserContext } from '../context/user.context';
import { useLocalStorage } from '../hooks/useLocalStorage';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';
import ChatRajSidebar from '../components/ChatRajSidebar';
import ChatRajSettingsModal from '../components/ChatRajSettingsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { CHATRAJ_TRANSLATIONS } from '../config/translations';
import { logger } from '../utils/logger';

// Modular components
import ChatRajHeader from '../components/chatraj/ChatRajHeader';
import ChatRajMessageList from '../components/chatraj/ChatRajMessageList';
import ChatRajInput from '../components/chatraj/ChatRajInput';

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    display: { darkMode: false, theme: { primary: '#3B82F6', secondary: '#1F2937', accent: '#10B981', customColors: false, messageColors: { user: '#3B82F6', ai: '#F3F4F6' } }, typography: { fontFamily: 'font-sans', userMessageSize: 'text-sm', aiMessageSize: 'text-sm', headerSize: 'text-xl', fontWeight: 'normal' }, chatBubbles: { roundness: 'rounded-lg', padding: 'normal', shadow: true }, animations: { messageTransition: true, interfaceTransitions: true, intensity: 'medium' } },
    behavior: { enterToSend: true, autoScroll: true, autoSave: true, notifications: true, animations: { messageTransition: true, interfaceTransitions: true, loadingAnimations: true }, autoComplete: true, spellCheck: true },
    accessibility: { language: 'en-US', fontSize: 'medium', reducedMotion: false, screenReader: false, contrastMode: 'normal', keyboardShortcuts: true, textToSpeech: true, speechToText: true },
    sidebar: { defaultOpen: true, width: '260px', showUserInfo: true, autoExpand: false, showTimestamps: true, pinnedChats: true, showNotifications: true, compactView: false, sortOrder: 'newest', groupByDate: true, showCategories: true },
    privacy: { saveHistory: true, autoDelete: { enabled: false, days: 30 } }
  }), []);

  const [settings, setSettings] = useLocalStorage('chatrajSettings', defaultSettings);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const t = useCallback((key) => {
    const lang = settings.accessibility.language;
    return CHATRAJ_TRANSLATIONS[lang]?.[key] || CHATRAJ_TRANSLATIONS['en-US'][key];
  }, [settings.accessibility.language]);

  const speakResponse = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || ['Samantha', 'Victoria', 'Karen', 'Tessa'].some(n => v.name.includes(n)));
      if (femaleVoice) { utterance.voice = femaleVoice; utterance.pitch = 1.2; utterance.rate = 0.9; }
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleSubmit = useCallback(async (e, voiceInput = null) => {
    e?.preventDefault();
    const content = voiceInput || inputMessage;
    if (!content.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content, timestamp: new Date().toISOString() }]);
    setInputMessage(''); setIsThinking(true);

    try {
      const res = await axios.post("/api/ai", { prompt: content, userApiKey: user?.googleApiKey });
      const aiResponse = res.data?.response || "I'm here to help! 🌟";
      const aiMsg = { type: 'ai', content: aiResponse, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      if (voiceInput || settings.accessibility.textToSpeech) speakResponse(aiMsg.content);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'ai', content: "Connection error. Please try again.", timestamp: new Date().toISOString(), isError: true }]);
      showToast("AI Service Error", "error");
    } finally { setIsThinking(false); }
  }, [inputMessage, speakResponse, user?.googleApiKey, settings.accessibility.textToSpeech, showToast]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const rec = new window.webkitSpeechRecognition();
      rec.continuous = false; rec.interimResults = false; rec.lang = settings.accessibility.language;
      rec.onresult = (e) => handleSubmit(null, e.results[0][0].transcript);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
    return () => recognitionRef.current?.abort();
  }, [handleSubmit, settings.accessibility.language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.display.theme.primary);
    root.style.setProperty('--primary-color-transparent', `${settings.display.theme.primary}80`);
  }, [settings.display.darkMode, settings.display.theme]);

  useEffect(() => {
    if (settings.privacy.saveHistory) {
      const saved = localStorage.getItem('chatHistory');
      if (saved) try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setMessages(parsed); } catch (e) { logger.error('History load error', e); }
    }
  }, [settings.privacy.saveHistory]);

  useEffect(() => {
    if (settings.privacy.saveHistory && messages.length > 0) localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages, settings.privacy.saveHistory]);

  useEffect(() => {
    if (settings.behavior.autoScroll) messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, settings.behavior.autoScroll]);

  const updateSettings = (cat, key, val) => setSettings(p => ({ ...p, [cat]: { ...p[cat], [key]: val } }));
  const updateNestedSettings = (cat, sub, key, val) => setSettings(p => ({ ...p, [cat]: { ...p[cat], [sub]: { ...p[cat][sub], [key]: val } } }));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <ChatRajSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} settings={settings} handleNewChat={() => { setMessages([]); localStorage.removeItem('chatHistory'); }} t={t} isDarkMode={settings.display.darkMode} />
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <ChatRajHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setIsSettingsOpen={setIsSettingsOpen} t={t} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
            <ChatRajMessageList messages={messages} isThinking={isThinking} settings={settings} t={t} formatMessageTime={formatMessageTime} messageEndRef={messageEndRef} setInputMessage={setInputMessage} handleSubmit={handleSubmit} />
        </div>
        <ChatRajInput handleSubmit={handleSubmit} inputRef={inputRef} inputMessage={inputMessage} setInputMessage={setInputMessage} settings={settings} startListening={() => { setIsListening(true); recognitionRef.current?.start(); }} isListening={isListening} isThinking={isThinking} t={t} />
        <ChatRajSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} activeSettingsTab={activeSettingsTab} setActiveSettingsTab={setActiveSettingsTab} settings={settings} updateSettings={updateSettings} updateNestedSettings={updateNestedSettings} handlePrivacyToggle={() => { const next = !settings.privacy.saveHistory; updateSettings('privacy', 'saveHistory', next); if (!next) { localStorage.removeItem('chatHistory'); setMessages([]); } }} clearChatHistory={() => setIsConfirmClearOpen(true)} t={t} languages={{ 'en-US': { name: 'English (US)' }, 'hi-IN': { name: 'Hindi (हिंदी)' } }} />
        <ConfirmationModal isOpen={isConfirmClearOpen} onClose={() => setIsConfirmClearOpen(false)} onConfirm={() => { setMessages([]); localStorage.removeItem('chatHistory'); setIsConfirmClearOpen(false); }} title={t('clearHistory')} message={t('historyClearConfirm')} confirmText="Clear History" type="danger" />
      </main>
    </div>
  );
};

export default ChatRaj;
