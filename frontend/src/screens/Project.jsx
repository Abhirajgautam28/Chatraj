import React, { useRef, useState, useEffect, useContext, useMemo } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import { getWebContainer } from '../config/webContainer'
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import ChatMessage from '../components/ChatMessage';
import FileTree from '../components/FileTree';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import {
  PROJECT_TRANSLATIONS,
  deduplicateMessages,
  groupMessagesByDate,
  normalizeFileTree
} from '../utils/project.utils';

function useProjectTranslation(language) {
  return useMemo(() => {
    const lang = PROJECT_TRANSLATIONS[language] ? language : 'en-US';
    return (key) => PROJECT_TRANSLATIONS[lang][key] || key;
  }, [language]);
}

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])
  return <code {...props} ref={ref} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', display: 'block' }} />
}

SyntaxHighlightedCode.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

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
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const sanitizeIframeUrl = (rawValue) => {
    if (!rawValue) return null;
    try {
      const url = new URL(rawValue, window.location.origin);
      if (url.origin !== window.location.origin) return null;
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      return url.toString();
    } catch { return null; }
  };

  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('projectSettings');
    const defaultSettings = {
      display: { darkMode: isDarkMode, showAvatars: true, vimMode: false },
      behavior: { autoScroll: true, enterToSend: true, showSystemMessages: true, collapseReplies: false, showReadReceipts: true },
      accessibility: { language: 'en-US' },
      privacy: { saveHistory: true },
      sidebar: { showFileTree: true, showCollaborators: true, pinSidebar: false, sidebarWidth: 240 },
    };
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

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
  const [expandedReplies, setExpandedReplies] = useState({});

  const toggleEmojiPicker = (messageId) => {
    setMessageEmojiPickers(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleReaction = (messageId, emoji, userId) => {
    const message = messages.find(m => m._id === messageId);
    if (!message || message.sender._id === userId) return;

    const existingReaction = message.reactions?.find(r => r.userId === userId);
    const newReactions = message.reactions?.filter(r => r.userId !== userId) || [];
    if (!existingReaction || existingReaction.emoji !== emoji) {
      newReactions.push({ userId, emoji });
    }

    sendMessage("message-reaction", {
      messageId,
      emoji: !existingReaction || existingReaction.emoji !== emoji ? emoji : null,
      userId,
      reactions: newReactions
    });

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg._id === messageId ? { ...msg, reactions: newReactions } : msg
      )
    );
    toggleEmojiPicker(messageId);
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(id)) newSelected.delete(id)
      else newSelected.add(id)
      return newSelected
    })
  }

  function addCollaborators() {
    axios.put("/api/projects/add-user", {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(() => setIsModalOpen(false)).catch(console.error)
  }

  const send = () => {
    if (!message.trim()) return;
    sendMessage("project-message", {
      message, sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null,
      googleApiKey: user.googleApiKey
    });
    setMessage("");
    setReplyingTo(null);
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendMessage('typing', { userId: user._id, projectId: project._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendMessage('stop-typing', { userId: user._id, projectId: project._id });
    }, 1000);
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await axios.post("/api/ai", { prompt: aiInput, userApiKey: user.googleApiKey });
      setAiResponse(res.data?.response || "No response from AI.");
    } catch (err) {
      setAiResponse("Error: " + (err.response?.data?.error || err.message));
    }
    setAiLoading(false);
  };

  useEffect(() => {
    if (messages.length && messageBox.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg._id) sendMessage("message-read", { messageId: lastMsg._id, userId: user._id })
    }
  }, [messages, user])

  useEffect(() => {
    if (window.__webcontainerBooted) return;
    window.__webcontainerBooted = true;
    initializeSocket(project._id)
    getWebContainer().then(setWebContainer);
    axios.get(`/api/projects/get-project/${project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })
    axios.get("/api/users/all").then((res) => setUsers(res.data.users)).catch(console.error)
  }, [project._id])

  useEffect(() => {
    if (messageBox.current) messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handleIncomingMessage = (data) => {
      if (data.sender?._id === "Chatraj") {
        try {
          const aiResponse = JSON.parse(data.message);
          if (aiResponse.fileTree) {
            const normalizedTree = normalizeFileTree(aiResponse.fileTree);
            setFileTree(normalizedTree);
            axios.put('/api/projects/update-file-tree', { projectId: project._id, fileTree: normalizedTree });
          }
          setMessages((prev) => {
            if (prev.some(m => m._id === data._id)) return prev;
            return [...prev, { ...data, message: aiResponse.text || data.message }];
          });
          return;
        } catch { /* not JSON */ }
      }
      setMessages((prev) => prev.some(m => m._id === data._id) ? prev : [...prev, data]);
    }
    receiveMessage("project-message", handleIncomingMessage)
  }, [project._id])

  useEffect(() => {
    receiveMessage('typing', (d) => d.userId !== user._id && setTypingUsers(p => new Set([...p, d.userId])));
    receiveMessage('stop-typing', (d) => setTypingUsers(p => { const s = new Set(p); s.delete(d.userId); return s; }));
    receiveMessage("message-reaction", (u) => setMessages(p => p.map(m => m._id === u._id ? u : m)));
  }, [user._id]);

  useEffect(() => { setMessages(prev => deduplicateMessages(prev)); }, [messages.length]);

  const filteredMessages = searchTerm ? messages.filter(m => m.message.toLowerCase().includes(searchTerm.toLowerCase())) : messages;
  const groupedMessages = groupMessagesByDate(filteredMessages);

  const bubbleRoundnessClass = { small: 'rounded', medium: 'rounded-lg', large: 'rounded-xl', 'extra-large': 'rounded-3xl' }[settings.display?.bubbleRoundness || 'large'];
  const messageFontSizeClass = { small: 'text-sm', medium: 'text-base', large: 'text-lg' }[settings.display?.messageFontSize || 'medium'];

  const getUserBubbleStyle = () => {
    const bg = settings.display.themeColor || '#3B82F6';
    let textColor = (isDarkMode || bg.toLowerCase() === 'white' || bg.toLowerCase() === '#fff') ? '#fff' : '#000';
    if (!isDarkMode) textColor = '#000';
    return { backgroundColor: bg, color: textColor };
  };

  function getMessageStatus(msg) {
    if (!msg || msg.sender?._id !== user._id) return null;
    const others = (project.users || []).filter(u => u._id !== user._id).map(u => u._id);
    if (msg.readBy?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Seen', icon: 'double-green' };
    if (msg.deliveredTo?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Received', icon: 'double' };
    return { label: 'Sent', icon: 'single' };
  }

  useEffect(() => {
    if (project?._id) axios.get(`/api/projects/settings/${project._id}`).then(res => {
      if (res.data?.settings) {
        setSettings(p => ({ ...p, ...res.data.settings }));
        if (res.data.settings.display?.darkMode !== undefined) setIsDarkMode(res.data.settings.display.darkMode);
      }
    }).catch(() => { });
  }, [project?._id, setIsDarkMode]);

  useEffect(() => {
    if (project?._id) axios.put(`/api/projects/settings/${project._id}`, { settings }).catch(() => { });
    localStorage.setItem('projectSettings', JSON.stringify(settings));
    setIsDarkMode(settings.display.darkMode);
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings, project?._id, setIsDarkMode]);

  const updateSettings = (category, key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [category]: { ...prev[category], [key]: value } };
      if (category === 'sidebar' && project?._id) axios.put(`/api/projects/sidebar-settings/${project._id}`, { sidebar: updated.sidebar }).catch(console.error);
      return updated;
    });
  };

  useEffect(() => { setSettings(p => ({ ...p, display: { ...p.display, vimMode } })); }, [vimMode]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-transparent">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-100 dark:bg-gray-800">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg">
              <i className="ri-user-add-fill"></i><span>{t('addUsers')}</span>
            </button>
            {settings.display?.aiAssistant && (
              <button className="p-2" onClick={() => setIsAIModalOpen(true)}><i className="ri-robot-2-line"></i></button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><i className="text-xl ri-settings-3-line"></i></button>
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><i className="ri-search-eye-fill"></i></button>
            {showSearch && (
               <input type="text" placeholder={t('searchMessages')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48 p-2 text-sm text-gray-800 bg-white border rounded dark:text-white dark:bg-gray-700" />
            )}
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><i className="ri-user-community-line"></i></button>
          </div>
        </header>
        <div ref={messageBox} className="flex flex-col flex-grow gap-1 p-1 pb-20 overflow-auto pt-14 message-box scrollbar-hide bg-slate-50 dark:bg-gray-800">
          {Object.keys(groupedMessages).sort().map((label) => (
            <div key={label}>
              <div className="py-2 text-sm text-center text-gray-500 dark:text-gray-400">{label}</div>
              {groupedMessages[label].map((msg, idx) => (
                <ChatMessage key={msg._id || idx} msg={msg} user={user} isDarkMode={isDarkMode} settings={settings} onReply={setReplyingTo} onReaction={handleReaction} messageFontSizeClass={messageFontSizeClass} bubbleRoundnessClass={bubbleRoundnessClass} getUserBubbleStyle={getUserBubbleStyle} SyntaxHighlightedCode={SyntaxHighlightedCode} toggleEmojiPicker={toggleEmojiPicker} isEmojiPickerOpen={messageEmojiPickers[msg._id]} getMessageStatus={getMessageStatus} />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 flex w-full bg-white inputField dark:bg-gray-800">
          <input value={message} onChange={(e) => { setMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => settings.behavior.enterToSend && e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} className="flex-grow p-2 px-4 bg-transparent outline-none dark:text-white" type="text" placeholder="Enter message" />
          <button onClick={send} style={{ backgroundColor: settings.display.themeColor || '#3B82F6' }} className="px-5 text-white"><i className="ri-send-plane-fill"></i></button>
        </div>
        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 dark:bg-gray-800 absolute transition-all ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0`}>
          <header className="flex items-center justify-between p-2 px-4 bg-slate-200 dark:bg-gray-700">
            <h1 className="text-lg font-semibold dark:text-white">Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(false)} className="p-2"><i className="ri-close-fill"></i></button>
          </header>
          <div className="flex flex-col gap-2 users">
            {project.users?.map((u) => (
              <div key={u._id} className="flex items-center gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-700">
                <Avatar firstName={u.firstName} className="w-12 h-12 text-base" />
                <h1 className="text-lg font-semibold dark:text-white">{u.firstName}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 right">
        <div className="h-full explorer bg-slate-200 dark:bg-gray-500" style={{ maxWidth: settings.sidebar?.sidebarWidth || 240, minWidth: settings.sidebar?.sidebarWidth || 240 }}>
            <button onClick={() => setShowOptionsModal(true)} className="flex items-center gap-2 p-2 px-4 m-2 font-semibold text-white bg-blue-600 rounded shadow">{t('options')}</button>
            {settings.sidebar?.showFileTree !== false && (
              <FileTree fileTree={fileTree} onFileClick={(f) => { setCurrentFile(f); setOpenFiles([...new Set([...openFiles, f])]); }} currentFile={currentFile} isDarkMode={isDarkMode} />
            )}
        </div>
        <div className="flex flex-col flex-grow h-full code-editor shrink">
          <div className="flex files overflow-x-auto bg-slate-100 dark:bg-gray-800">
            {openFiles.map((file) => (
              <button key={file} onClick={() => setCurrentFile(file)} className={`p-2 px-4 whitespace-nowrap ${currentFile === file ? "bg-slate-400 dark:bg-gray-600" : "bg-slate-300 dark:bg-gray-700"}`}>{file}</button>
            ))}
          </div>
          <div className="flex-grow code-editor-area bg-slate-50 dark:bg-gray-900 relative min-h-0">
              {fileTree && currentFile && fileTree[currentFile]?.file?.contents ? (
                  vimMode ? (
                    <VimCodeEditor value={fileTree[currentFile].file.contents} onChange={(v) => setFileTree(p => ({ ...p, [currentFile]: { ...p[currentFile], file: { ...p[currentFile].file, contents: v } } }))} isDarkMode={isDarkMode} />
                  ) : (
                    <CodeMirror value={fileTree[currentFile].file.contents} theme={isDarkMode ? 'dark' : 'light'} extensions={[javascript()]} onChange={(v) => setFileTree(p => ({ ...p, [currentFile]: { ...p[currentFile], file: { ...p[currentFile].file, contents: v } } }))} />
                  )
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">{t('noFileSelected')}</div>
              )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-4 bg-white rounded-md w-96 max-w-full relative">
            <h2 className="text-xl font-semibold mb-4">{t('selectUser')}</h2>
            <div className="flex flex-col gap-2 overflow-auto max-h-96 mb-16">
              {users.map(u => (
                <div key={u._id} className={`p-2 flex gap-2 items-center cursor-pointer hover:bg-slate-100 ${selectedUserId.has(u._id) ? "bg-slate-200" : ""}`} onClick={() => handleUserClick(u._id)}>
                  <Avatar firstName={u.firstName} className="w-12 h-12" /><span>{u.firstName}</span>
                </div>
              ))}
            </div>
            <button onClick={addCollaborators} className="w-full py-2 text-white bg-blue-600 rounded-md">{t('addCollaborators')}</button>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><i className="ri-close-line text-2xl"></i></button>
          </div>
        </div>
      )}

      <ProjectSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} updateSettings={updateSettings} activeTab={activeSettingsTab} setActiveTab={setActiveSettingsTab} t={t} isDarkMode={isDarkMode} vimMode={vimMode} setVimMode={setVimMode} />
    </main>
  )
}

export default Project
