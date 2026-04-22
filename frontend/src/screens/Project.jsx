import React, { useRef, useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import AddCollaboratorsModal from '../components/AddCollaboratorsModal';
import AIAssistantModal from '../components/AIAssistantModal';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import SyntaxHighlightedCode from '../components/SyntaxHighlightedCode';
import { useSocket } from '../hooks/useSocket';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWebContainer } from '../hooks/useWebContainer';
import { useProjectState } from '../hooks/useProjectState';
import { useToast } from '../context/toast.context';
import {
  normalizeFileTree,
  groupMessagesByDate
} from '../utils/projectUtils';
import { PROJECT_TRANSLATIONS } from '../config/translations';

// Sub-components
import ProjectHeader from '../components/project/ProjectHeader';
import MessageList from '../components/project/MessageList';
import SidebarExplorer from '../components/project/SidebarExplorer';
import ResizablePanel from '../components/project/ResizablePanel';

function useProjectTranslation(language) {
  return React.useMemo(() => {
    const lang = PROJECT_TRANSLATIONS[language] ? language : 'en-US';
    return (key) => PROJECT_TRANSLATIONS[lang][key] || key;
  }, [language]);
}

const Project = () => {
  const location = useLocation()
  const { user } = useContext(UserContext)
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext)
  const { showToast } = useToast();

  const {
    project, setProject,
    messages, setMessages,
    fileTree, setFileTree,
    currentFile, setCurrentFile,
    openFiles, setOpenFiles,
    users, setUsers,
    selectedUserId,
    typingUsers, setTypingUsers,
    replyingTo, setReplyingTo,
    searchTerm, setSearchTerm,
    expandedReplies, setExpandedReplies,
    updateFileContents,
    toggleUserSelection
  } = useProjectState(location.state.project);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const messageBox = useRef(null)
  const { iframeUrl, runProject, isRunning, boot } = useWebContainer(fileTree);
  const [showSearch, setShowSearch] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const { on, off, emit } = useSocket(project._id);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const defaultSettings = useMemo(() => ({
    display: { darkMode: isDarkMode, showAvatars: true, vimMode: false, syntaxHighlighting: true, themeColor: '#3B82F6', messageFontSize: 'medium', bubbleRoundness: 'large', aiAssistant: true, showTimestamps: true },
    behavior: { autoScroll: true, enterToSend: true, showSystemMessages: true, collapseReplies: false, showReadReceipts: true },
    accessibility: { language: 'en-US' },
    privacy: { saveHistory: true },
    sidebar: { showFileTree: true, showCollaborators: true, pinSidebar: false, sidebarWidth: 240 },
  }), [isDarkMode]);

  const [settings, setSettings] = useLocalStorage('projectSettings', defaultSettings);
  const t = useProjectTranslation(settings.accessibility?.language || 'en-US');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('display');
  const [messageEmojiPickers, setMessageEmojiPickers] = useState({});

  const toggleEmojiPicker = useCallback((messageId, isOpen) => {
    setMessageEmojiPickers(prev => ({ ...prev, [messageId]: isOpen !== undefined ? isOpen : !prev[messageId] }));
  }, []);

  const handleReaction = useCallback((messageId, emoji, userId) => {
    const msg = messages.find(m => m._id === messageId);
    if (!msg) return;
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    if (senderId?.toString() === userId?.toString()) return;
    const existing = msg.reactions?.find(r => r.userId === userId);
    const nextReactions = (msg.reactions || []).filter(r => r.userId !== userId);
    if (!existing || existing.emoji !== emoji) nextReactions.push({ userId, emoji });

    emit("message-reaction", { messageId, emoji: !existing || existing.emoji !== emoji ? emoji : null, userId, reactions: nextReactions });
    setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: nextReactions } : m));
    toggleEmojiPicker(messageId, false);
  }, [messages, emit, setMessages, toggleEmojiPicker]);

  const addCollaborators = () => {
    axios.put("/api/projects/add-user", { projectId: project._id, users: Array.from(selectedUserId) })
      .then((res) => {
        if (res.data.project) setProject(res.data.project);
        setIsModalOpen(false);
        showToast('Collaborators added', 'success');
      })
      .catch(() => showToast('Failed to add collaborators', 'error'))
  }

  const send = () => {
    if (!message.trim()) return;
    emit("project-message", { message, sender: user, parentMessageId: replyingTo ? replyingTo._id : null, googleApiKey: user.googleApiKey });
    setMessage(""); setReplyingTo(null);
  }

  const handleTyping = () => {
    if (!isTyping) { setIsTyping(true); emit('typing', { userId: user._id, projectId: project._id }); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { setIsTyping(false); emit('stop-typing', { userId: user._id, projectId: project._id }); }, 1000);
  };

  useEffect(() => {
    boot();
    axios.get(`/api/projects/get-project/${project._id}`).then(res => {
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree || {});
    });
    axios.get("/api/users/all").then(res => setUsers(res.data.users)).catch(() => {});
  }, [boot, project._id, setProject, setFileTree, setUsers]);

  useEffect(() => {
    const handleIncoming = (data) => {
      if (data.sender?._id === "Chatraj") {
        try {
          const aiRes = JSON.parse(data.message);
          if (aiRes.fileTree) {
            const norm = normalizeFileTree(aiRes.fileTree);
            setFileTree(norm);
            axios.put('/api/projects/update-file-tree', { projectId: project._id, fileTree: norm });
          }
          setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, { ...data, message: aiRes.text || data.message }]);
          return;
        } catch {}
      }
      setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data]);
    };
    on("project-message", handleIncoming);
    return () => off("project-message", handleIncoming);
  }, [on, off, project._id, setFileTree, setMessages]);

  useEffect(() => {
    const onTyping = (d) => d.userId !== user._id && setTypingUsers(p => new Set([...p, d.userId]));
    const onStop = (d) => setTypingUsers(p => { const n = new Set(p); n.delete(d.userId); return n; });
    on('typing', onTyping); on('stop-typing', onStop);
    return () => { off('typing', onTyping); off('stop-typing', onStop); };
  }, [on, off, user._id, setTypingUsers]);

  useEffect(() => {
    const onReact = (m) => setMessages(prev => prev.map(msg => msg._id === m._id ? m : msg));
    on("message-reaction", onReact);
    return () => off("message-reaction", onReact);
  }, [on, off, setMessages]);

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

  const patchedMessages = useMemo(() => messages.map(msg => (msg.sender?._id === user?._id ? { ...msg, readBy: [user?._id, 'other'] } : msg)), [messages, user?._id]);
  const filteredMessages = useMemo(() => searchTerm ? patchedMessages.filter(m => m.message.toLowerCase().includes(searchTerm.toLowerCase())) : patchedMessages, [patchedMessages, searchTerm]);
  const groupedMessages = useMemo(() => groupMessagesByDate(filteredMessages), [filteredMessages]);

  const bubbleRoundnessClass = { small: 'rounded', medium: 'rounded-lg', large: 'rounded-xl', 'extra-large': 'rounded-3xl' }[settings.display?.bubbleRoundness || 'large'];
  const messageFontSizeClass = { small: 'text-sm', medium: 'text-base', large: 'text-lg' }[settings.display?.messageFontSize || 'medium'];
  const getUserBubbleStyle = useCallback(() => ({ backgroundColor: settings.display.themeColor || '#3B82F6', color: isDarkMode ? '#fff' : '#000' }), [settings.display.themeColor, isDarkMode]);

  const getMessageStatus = useCallback((msg) => {
    if (msg.sender?._id !== user._id) return null;
    const others = (project.users || []).filter(u => u._id !== user._id).map(u => u._id);
    if (msg.readBy?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Seen', icon: 'double-green' };
    if (msg.deliveredTo?.some(uid => uid !== user._id && others.includes(uid))) return { label: 'Received', icon: 'double' };
    return { label: 'Sent', icon: 'single' };
  }, [user._id, project.users]);

  useEffect(() => {
    axios.get(`/api/projects/settings/${project._id}`).then(res => res.data?.settings && setSettings(p => ({ ...p, ...res.data.settings }))).catch(() => {});
  }, [project._id, setSettings]);

  useEffect(() => {
    axios.put(`/api/projects/settings/${project._id}`, { settings }).catch(() => {});
    setIsDarkMode(settings.display.darkMode);
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings, project._id, setIsDarkMode]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-transparent">
      <ResizablePanel initialWidth={400} minWidth={350} maxWidth={800} direction="right">
        <section className="relative flex flex-col h-screen w-full bg-slate-100 dark:bg-gray-800">
            <ProjectHeader setIsModalOpen={setIsModalOpen} setIsAIModalOpen={() => {}} setIsSettingsOpen={setIsSettingsOpen} setShowSearch={setShowSearch} showSearch={showSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsSidePanelOpen={setIsSidePanelOpen} isSidePanelOpen={isSidePanelOpen} isDarkMode={isDarkMode} settings={settings} t={t} />
            <MessageList groupedMessages={groupedMessages} user={user} messages={messages} project={project} isDarkMode={isDarkMode} bubbleRoundnessClass={bubbleRoundnessClass} messageFontSizeClass={messageFontSizeClass} getUserBubbleStyle={getUserBubbleStyle} toggleEmojiPicker={toggleEmojiPicker} messageEmojiPickers={messageEmojiPickers} handleReaction={handleReaction} setReplyingTo={setReplyingTo} expandedReplies={expandedReplies} setExpandedReplies={setExpandedReplies} settings={settings} getMessageStatus={getMessageStatus} SyntaxHighlightedCode={SyntaxHighlightedCode} messageBoxRef={messageBox} handleScroll={() => setShowScrollBottom(messageBox.current?.scrollHeight - messageBox.current?.scrollTop - messageBox.current?.clientHeight > 300)} searchTerm={searchTerm} />
            {showScrollBottom && (
            <button onClick={() => messageBox.current?.scrollTo({ top: messageBox.current.scrollHeight, behavior: 'smooth' })} className="absolute z-20 w-10 h-10 text-white bg-blue-600 rounded-full shadow-lg bottom-24 right-6 animate-bounce">
                <i className="ri-arrow-down-line"></i>
            </button>
            )}
            <div className="absolute bottom-0 flex w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <input value={message} onChange={(e) => { setMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && settings.behavior.enterToSend && (e.preventDefault(), send())} className="flex-grow p-4 bg-transparent outline-none dark:text-white" placeholder={t('enterMessage')} />
            <button onClick={send} className="px-6 text-white hover:brightness-90" style={{ backgroundColor: settings.display.themeColor }}><i className="ri-send-plane-fill"></i></button>
            </div>
        </section>
      </ResizablePanel>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 overflow-hidden">
        <SidebarExplorer settings={settings} fileTree={fileTree} setCurrentFile={setCurrentFile} setOpenFiles={setOpenFiles} openFiles={openFiles} project={project} isDarkMode={isDarkMode} t={t} />
        <div className="flex flex-col flex-grow h-full code-editor overflow-hidden">
          <div className="flex justify-between w-full bg-slate-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              {openFiles.map(file => (
                <button key={file} onClick={() => setCurrentFile(file)} className={`p-3 px-6 flex items-center gap-2 border-r border-gray-300 dark:border-gray-700 text-sm font-medium ${currentFile === file ? "bg-white dark:bg-gray-900 dark:text-white" : "bg-slate-300/50 dark:bg-gray-800/50 dark:text-gray-400"}`}>{file}</button>
              ))}
            </div>
            <button onClick={() => runProject(showToast)} disabled={isRunning} className="m-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 disabled:opacity-50">{isRunning ? t('running') : t('run')}</button>
          </div>
          <div className="flex-grow relative overflow-hidden bg-white dark:bg-gray-950">
            {currentFile && fileTree[currentFile] ? (
              <div className="h-full">
                {settings.display.vimMode ? <VimCodeEditor value={fileTree[currentFile].file.contents} onChange={(v) => updateFileContents(currentFile, v)} isDarkMode={isDarkMode} /> : <CodeMirror value={fileTree[currentFile].file.contents} theme={isDarkMode ? 'dark' : 'light'} extensions={[javascript()]} onChange={(v) => updateFileContents(currentFile, v)} height="100%" />}
              </div>
            ) : <div className="h-full flex items-center justify-center text-gray-400 italic">{t('noFileSelected')}</div>}
          </div>
        </div>

        {iframeUrl && (
          <ResizablePanel initialWidth={450} minWidth={300} maxWidth={900} direction="left">
            <div className="h-full border-l border-gray-300 dark:border-gray-700 flex flex-col bg-white">
                <div className="p-2 bg-slate-100 dark:bg-gray-800 border-b flex gap-2"><input value={iframeUrl} readOnly className="flex-grow text-xs p-1.5 rounded bg-white dark:bg-gray-900 border dark:border-gray-700" /></div>
                <iframe src={iframeUrl} className="flex-grow w-full border-none" title="Project Preview" />
            </div>
          </ResizablePanel>
        )}
      </section>

      <AddCollaboratorsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} selectedUserId={selectedUserId} handleUserClick={toggleUserSelection} addCollaborators={addCollaborators} t={t} />
      <ProjectSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} updateSettings={updateSettings} activeSettingsTab={activeSettingsTab} setActiveSettingsTab={setActiveSettingsTab} t={t} />
    </main>
  );
};

export default Project;
