import React from 'react';
import { useRef, useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import AddCollaboratorsModal from '../components/AddCollaboratorsModal';
import AIAssistantModal from '../components/AIAssistantModal';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import SyntaxHighlightedCode from '../components/SyntaxHighlightedCode';
import { useSocket } from '../hooks/useSocket';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWebContainer } from '../hooks/useWebContainer';
import { useToast } from '../context/toast.context';
import { logger } from '../utils/logger';
import {
  sanitizeIframeUrl,
  normalizeFileTree,
  deduplicateMessages,
  groupMessagesByDate
} from '../utils/projectUtils';
import { PROJECT_TRANSLATIONS } from '../config/translations';

// Sub-components
import ProjectHeader from '../components/project/ProjectHeader';
import MessageList from '../components/project/MessageList';
import SidebarExplorer from '../components/project/SidebarExplorer';

function useProjectTranslation(language) {
  return React.useMemo(() => {
    const lang = PROJECT_TRANSLATIONS[language] ? language : 'en-US';
    return (key) => PROJECT_TRANSLATIONS[lang][key] || key;
  }, [language]);
}

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext)
  const messageBox = useRef(null)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const { webContainer, iframeUrl, runProject, isRunning, boot, setIframeUrl } = useWebContainer(fileTree);
  const [replyingTo, setReplyingTo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const { on, off, emit } = useSocket(project._id);

  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const defaultSettings = React.useMemo(() => ({
    display: {
      darkMode: isDarkMode,
      showAvatars: true,
      vimMode: false,
      syntaxHighlighting: true,
      themeColor: '#3B82F6',
      messageFontSize: 'medium',
      bubbleRoundness: 'large',
      aiAssistant: true,
      showTimestamps: true,
    },
    behavior: {
      autoScroll: true,
      enterToSend: true,
      showSystemMessages: true,
      collapseReplies: false,
      showReadReceipts: true,
    },
    accessibility: {
      language: 'en-US',
    },
    privacy: {
      saveHistory: true,
    },
    sidebar: {
      showFileTree: true,
      showCollaborators: true,
      pinSidebar: false,
      sidebarWidth: 240,
    },
  }), [isDarkMode]);

  const [settings, setSettings] = useLocalStorage('projectSettings', defaultSettings);
  const language = settings.accessibility?.language || 'en-US';
  const t = useProjectTranslation(language);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('display');
  const [messageEmojiPickers, setMessageEmojiPickers] = useState({});
  const [vimMode, setVimMode] = useState(() => settings.display?.vimMode || false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState(null);
  const settingsModalRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const { showToast } = useToast();

  const toggleEmojiPicker = (messageId, isOpen) => {
    setMessageEmojiPickers(prev => ({
      ...prev,
      [messageId]: isOpen !== undefined ? isOpen : !prev[messageId]
    }));
  };

  const handleReaction = (messageId, emoji, userId) => {
    const msg = messages.find(m => m._id === messageId);
    if (!msg) return;
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    if (senderId?.toString() === userId?.toString()) return;
    const existingReaction = msg.reactions?.find(r => r.userId === userId);
    const newReactions = msg.reactions?.filter(r => r.userId !== userId) || [];
    if (!existingReaction || existingReaction.emoji !== emoji) {
      newReactions.push({ userId, emoji });
    }
    emit("message-reaction", {
      messageId,
      emoji: !existingReaction || existingReaction.emoji !== emoji ? emoji : null,
      userId,
      reactions: newReactions
    });
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: newReactions } : m));
    toggleEmojiPicker(messageId, false);
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    })
  }

  const addCollaborators = () => {
    axios.put("/api/projects/add-user", {
      projectId: project._id,
      users: Array.from(selectedUserId)
    })
    .then((res) => {
      if (res.data.project) setProject(res.data.project);
      setIsModalOpen(false);
      showToast('Collaborators added', 'success');
    })
    .catch(() => showToast('Failed to add collaborators', 'error'))
  }

  const send = () => {
    if (!message.trim()) return;
    emit("project-message", {
      message,
      sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null,
      googleApiKey: user.googleApiKey
    });
    setMessage("");
    setReplyingTo(null);
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      emit('typing', { userId: user._id, projectId: project._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit('stop-typing', { userId: user._id, projectId: project._id });
    }, 1000);
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await axios.post("/api/ai", { prompt: aiInput, userApiKey: user.googleApiKey });
      setAiResponse(res.data?.response || "No response.");
    } catch (err) {
      setAiResponse("Error: " + (err.response?.data?.error || err.message));
    }
    setAiLoading(false);
  };

  useEffect(() => {
    boot();
    axios.get(`/api/projects/get-project/${project._id}`).then((res) => {
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree || {});
    });
    axios.get("/api/users/all").then((res) => setUsers(res.data.users)).catch(() => {});
  }, [boot, project._id]);

  useEffect(() => {
    const handleIncomingMessage = (data) => {
      if (data.sender && data.sender._id === "Chatraj") {
        try {
          const aiRes = JSON.parse(data.message);
          if (aiRes.fileTree) {
            const normalized = normalizeFileTree(aiRes.fileTree);
            setFileTree(normalized);
            axios.put('/api/projects/update-file-tree', { projectId: project._id, fileTree: normalized });
          }
          setMessages(prev => {
            if (prev.some(m => m._id === data._id)) return prev;
            return [...prev, { ...data, message: aiRes.text || data.message }];
          });
          return;
        } catch {}
      }
      setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data]);
    };
    on("project-message", handleIncomingMessage);
    return () => off("project-message", handleIncomingMessage);
  }, [on, off, project._id]);

  useEffect(() => {
    const onTyping = (d) => d.userId !== user._id && setTypingUsers(p => new Set([...p, d.userId]));
    const onStop = (d) => setTypingUsers(p => { const n = new Set(p); n.delete(d.userId); return n; });
    on('typing', onTyping); on('stop-typing', onStop);
    return () => { off('typing', onTyping); off('stop-typing', onStop); };
  }, [on, off, user._id]);

  useEffect(() => {
    const onReact = (m) => setMessages(prev => prev.map(msg => msg._id === m._id ? m : msg));
    on("message-reaction", onReact);
    return () => off("message-reaction", onReact);
  }, [on, off]);

  useEffect(() => {
    if (messages.length && messageBox.current) {
      const last = messages[messages.length - 1];
      if (last._id) emit("message-read", { messageId: last._id, userId: user._id });
    }
  }, [messages, user._id, emit]);

  useEffect(() => {
    if (messageBox.current && settings.behavior.autoScroll)
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }, [messages, settings.behavior.autoScroll]);

  const patchedMessages = React.useMemo(() => {
    return messages.map(msg => (msg.sender?._id === user?._id ? { ...msg, readBy: [user?._id, 'other'] } : msg));
  }, [messages, user?._id]);

  const filteredMessages = React.useMemo(() => {
    if (!searchTerm) return patchedMessages;
    const lower = searchTerm.toLowerCase();
    return patchedMessages.filter(m => m.message.toLowerCase().includes(lower));
  }, [patchedMessages, searchTerm]);

  const groupedMessages = React.useMemo(() => groupMessagesByDate(filteredMessages), [filteredMessages]);

  const bubbleRoundnessClass = { small: 'rounded', medium: 'rounded-lg', large: 'rounded-xl', 'extra-large': 'rounded-3xl' }[settings.display?.bubbleRoundness || 'large'];
  const messageFontSizeClass = { small: 'text-sm', medium: 'text-base', large: 'text-lg' }[settings.display?.messageFontSize || 'medium'];

  const getUserBubbleStyle = React.useCallback(() => ({
    backgroundColor: settings.display.themeColor || '#3B82F6',
    color: isDarkMode ? '#fff' : '#000'
  }), [settings.display.themeColor, isDarkMode]);

  const handleScroll = () => {
    if (!messageBox.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageBox.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  function getMessageStatus(msg) {
    if (msg.sender?._id !== user._id) return null;
    const others = (project.users || []).filter(u => u._id !== user._id).map(u => u._id);
    if (msg.readBy?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Seen', icon: 'double-green' };
    if (msg.deliveredTo?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Received', icon: 'double' };
    return { label: 'Sent', icon: 'single' };
  }

  const updateSettings = (cat, key, val) => {
    const next = { ...settings, [cat]: { ...settings[cat], [key]: val } };
    setSettings(next);
    if (cat === 'sidebar') axios.put(`/api/projects/sidebar-settings/${project._id}`, { sidebar: next.sidebar });
  };

  useEffect(() => {
    axios.get(`/api/projects/settings/${project._id}`).then(res => {
      if (res.data?.settings) setSettings(p => ({ ...p, ...res.data.settings }));
    }).catch(() => {});
  }, [project._id]);

  useEffect(() => {
    axios.put(`/api/projects/settings/${project._id}`, { settings }).catch(() => {});
  }, [settings, project._id]);

  useEffect(() => {
    setIsDarkMode(settings.display.darkMode);
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings.display.darkMode, setIsDarkMode]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-transparent">
      <section className="relative flex flex-col h-screen min-w-96 bg-slate-100 dark:bg-gray-800">
        <ProjectHeader
          setIsModalOpen={setIsModalOpen}
          setIsAIModalOpen={setIsAIModalOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          setShowSearch={setShowSearch}
          showSearch={showSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsSidePanelOpen={setIsSidePanelOpen}
          isSidePanelOpen={isSidePanelOpen}
          isDarkMode={isDarkMode}
          settings={settings}
          t={t}
        />

        <MessageList
          groupedMessages={groupedMessages}
          user={user}
          messages={messages}
          project={project}
          isDarkMode={isDarkMode}
          bubbleRoundnessClass={bubbleRoundnessClass}
          messageFontSizeClass={messageFontSizeClass}
          getUserBubbleStyle={getUserBubbleStyle}
          toggleEmojiPicker={toggleEmojiPicker}
          messageEmojiPickers={messageEmojiPickers}
          handleReaction={handleReaction}
          setReplyingTo={setReplyingTo}
          expandedReplies={expandedReplies}
          setExpandedReplies={setExpandedReplies}
          settings={settings}
          getMessageStatus={getMessageStatus}
          SyntaxHighlightedCode={SyntaxHighlightedCode}
          messageBoxRef={messageBox}
          handleScroll={handleScroll}
        />

        {showScrollBottom && (
          <button onClick={() => messageBox.current?.scrollTo({ top: messageBox.current.scrollHeight, behavior: 'smooth' })} className="absolute z-20 w-10 h-10 text-white bg-blue-600 rounded-full shadow-lg bottom-24 right-6 animate-bounce">
            <i className="ri-arrow-down-line"></i>
          </button>
        )}

        <div className="absolute bottom-0 flex w-full bg-white dark:bg-gray-800">
          <input value={message} onChange={(e) => { setMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && settings.behavior.enterToSend && (e.preventDefault(), send())} className="flex-grow p-4 bg-transparent outline-none dark:text-white" placeholder={t('enterMessage')} />
          <button onClick={send} className="px-6 text-white hover:brightness-90" style={{ backgroundColor: settings.display.themeColor }}><i className="ri-send-plane-fill"></i></button>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 overflow-hidden">
        <SidebarExplorer
          settings={settings}
          fileTree={fileTree}
          setCurrentFile={setCurrentFile}
          setOpenFiles={setOpenFiles}
          openFiles={openFiles}
          project={project}
          isDarkMode={isDarkMode}
          t={t}
        />

        <div className="flex flex-col flex-grow h-full code-editor overflow-hidden">
          <div className="flex justify-between w-full bg-slate-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              {openFiles.map(file => (
                <button key={file} onClick={() => setCurrentFile(file)} className={`p-3 px-6 flex items-center gap-2 border-r border-gray-300 dark:border-gray-700 text-sm font-medium ${currentFile === file ? "bg-white dark:bg-gray-900 dark:text-white" : "bg-slate-300/50 dark:bg-gray-800/50 dark:text-gray-400"}`}>
                  {file}
                </button>
              ))}
            </div>
            <button onClick={() => runProject(showToast)} disabled={isRunning} className="m-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 disabled:opacity-50">
              {isRunning ? t('running') : t('run')}
            </button>
          </div>

          <div className="flex-grow relative overflow-hidden bg-white dark:bg-gray-950">
            {currentFile && fileTree[currentFile] ? (
              <div className="h-full">
                {vimMode ? (
                   <VimCodeEditor value={fileTree[currentFile].file.contents} onChange={(v) => setFileTree(p => ({ ...p, [currentFile]: { ...p[currentFile], file: { ...p[currentFile].file, contents: v } } }))} isDarkMode={isDarkMode} />
                ) : (
                  <CodeMirror value={fileTree[currentFile].file.contents} theme={isDarkMode ? 'dark' : 'light'} extensions={[javascript()]} onChange={(v) => setFileTree(p => ({ ...p, [currentFile]: { ...p[currentFile], file: { ...p[currentFile].file, contents: v } } }))} height="100%" />
                )}
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400 italic">{t('noFileSelected')}</div>}
          </div>
        </div>

        {iframeUrl && (
          <div className="w-[450px] border-l border-gray-300 dark:border-gray-700 flex flex-col bg-white">
            <div className="p-2 bg-slate-100 dark:bg-gray-800 border-b flex gap-2">
              <input value={iframeUrl} readOnly className="flex-grow text-xs p-1.5 rounded bg-white dark:bg-gray-900 border dark:border-gray-700" />
            </div>
            <iframe src={iframeUrl} className="flex-grow w-full border-none" />
          </div>
        )}
      </section>

      <AddCollaboratorsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} selectedUserId={selectedUserId} handleUserClick={handleUserClick} addCollaborators={addCollaborators} t={t} />
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} aiInput={aiInput} setAiInput={setAiInput} aiResponse={aiResponse} aiLoading={aiLoading} handleAISend={handleAISend} />
      <ProjectSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} updateSettings={updateSettings} activeSettingsTab={activeSettingsTab} setActiveSettingsTab={setActiveSettingsTab} t={t} />
    </main>
  );
};

export default Project;
