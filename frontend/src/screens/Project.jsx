import React, { useRef, useState, useEffect, useContext } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import Markdown from 'markdown-to-jsx'
import { getWebContainer } from '../config/webContainer'
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import FileIcon from '../components/FileIcon';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import VimCodeEditor from '../components/VimCodeEditor';
import ChatMessage from '../components/ChatMessage';
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
  // Language translation hook for this page (must be after settings is defined)
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
  const [modalPosition, setModalPosition] = useState(null); // null means center
  const settingsModalRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({}); // Track expanded replies
  const { showToast } = useToast();

  const toggleEmojiPicker = (messageId, isOpen) => {
    setMessageEmojiPickers(prev => ({
      ...prev,
      [messageId]: isOpen !== undefined ? isOpen : !prev[messageId]
    }));
  };

  const handleReaction = (messageId, emoji, userId) => {
    const message = messages.find(m => m._id === messageId);
    if (!message) return;

    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    if (senderId?.toString() === userId?.toString()) {
      return;
    }

    const existingReaction = message.reactions?.find(r => r.userId === userId);

    const newReactions = message.reactions?.filter(r => r.userId !== userId) || [];
    if (!existingReaction || existingReaction.emoji !== emoji) {
      newReactions.push({ userId, emoji });
    }

    emit("message-reaction", {
      messageId,
      emoji: !existingReaction || existingReaction.emoji !== emoji ? emoji : null,
      userId,
      reactions: newReactions
    });

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg._id === messageId
          ? { ...msg, reactions: newReactions }
          : msg
      )
    );

    setMessageEmojiPickers(prev => ({
      ...prev,
      [messageId]: false
    }));
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      return newSelected
    })
  }

  function addCollaborators() {
    axios
      .put("/api/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId)
      })
      .then((res) => {
        if (res.data.project) {
          setProject(res.data.project);
        }
        setIsModalOpen(false);
      })
      .catch((err) => {
        showToast('Failed to add collaborators', 'error');
        logger.error(err);
      })
  }

  const send = () => {
    if (!message.trim()) return;
    const payload = {
      message,
      sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null,
      googleApiKey: user.googleApiKey // send user's Gemini key
    };
    emit("project-message", payload);
    setMessage("");
    setReplyingTo(null);
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      emit('typing', { userId: user._id, projectId: project._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit('stop-typing', { userId: user._id, projectId: project._id });
    }, 1000);
  };

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      // Send user's googleApiKey for Gemini API access
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
      if (lastMsg._id) {
        emit("message-read", { messageId: lastMsg._id, userId: user._id })
      }
    }
  }, [messages, user, emit])

  useEffect(() => {
    boot();
    axios.get(`/api/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })
    axios
      .get("/api/users/all")
      .then((res) => {
        setUsers(res.data.users)
      })
      .catch((err) => {
        showToast('Failed to fetch users', 'error');
        logger.error(err);
      });
  }, [boot, location.state.project._id])

  useEffect(() => {
    if (messageBox.current)
      messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handleIncomingMessage = (data) => {
      // If the sender is Chatraj and the message is a JSON with fileTree, update the file tree
      if (data.sender && data.sender._id === "Chatraj") {
        try {
          const aiResponse = JSON.parse(data.message);
          if (aiResponse.fileTree) {
            const normalizedTree = normalizeFileTree(aiResponse.fileTree);
            setFileTree(normalizedTree);
            // Optionally, update the backend as well:
            axios.put('/api/projects/update-file-tree', {
              projectId: project._id,
              fileTree: normalizedTree
            });
          }
          // Only show the AI's text in chat if it is not a duplicate
          setMessages((prev) => {
            // Prevent duplicate messages with the same _id and sender
            if (prev.some(m => m._id === data._id && m.sender?._id === data.sender?._id)) {
              return prev;
            }
            const updated = [
              ...prev,
              {
                ...data,
                message: aiResponse.text || data.message
              }
            ];
            return deduplicateMessages(updated);
          });
          return;
        } catch {
          // If not JSON, just show as normal message
        }
      }
      // Default: just add the message if not a duplicate
      setMessages((prev) => {
        if (prev.some(m => m._id === data._id && m.sender?._id === data.sender?._id)) {
          return prev;
        }
        const updated = [...prev, data];
        return deduplicateMessages(updated);
      });
    }

    on("project-message", handleIncomingMessage);
    return () => off("project-message", handleIncomingMessage);
  }, [on, off, project._id]);

  useEffect(() => {
    const handleUserTyping = (data) => {
      if (data.userId !== user._id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      }
    };

    const handleStopTyping = (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    on('typing', handleUserTyping);
    on('stop-typing', handleStopTyping);

    return () => {
      off('typing', handleUserTyping);
      off('stop-typing', handleStopTyping);
    };
  }, [on, off, user._id]);

  useEffect(() => {
    const handleReactionUpdate = (updatedMessage) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    on("message-reaction", handleReactionUpdate);
    return () => off("message-reaction", handleReactionUpdate);
  }, [on, off]);

  // Patch messages to simulate readBy for current user's messages
  const patchedMessages = React.useMemo(() => {
    return messages.map(msg => {
      if (msg.sender && msg.sender?._id === user?._id) {
        return { ...msg, readBy: [user?._id, 'other-user'] };
      }
      return msg;
    });
  }, [messages, user?._id]);

  const filteredMessages = React.useMemo(() => {
    if (!searchTerm) return patchedMessages;
    const lowerSearch = searchTerm.toLowerCase();
    return patchedMessages.filter((msg) => {
      // Check direct message content
      if (msg.message.toLowerCase().includes(lowerSearch)) return true;
      // Also search inside AI JSON response text if applicable
      if (msg.sender && msg.sender._id === "Chatraj") {
        try {
          const parsed = JSON.parse(msg.message);
          if (parsed.text && parsed.text.toLowerCase().includes(lowerSearch)) return true;
        } catch { /* ignore */ }
      }
      return false;
    });
  }, [patchedMessages, searchTerm]);

  const groupedMessages = React.useMemo(() => {
    return groupMessagesByDate(filteredMessages);
  }, [filteredMessages]);

  // Map bubble roundness setting to Tailwind classes
  const bubbleRoundnessClass = {
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    'extra-large': 'rounded-3xl',
  }[settings.display?.bubbleRoundness || 'large'];
  // Map message font size to Tailwind classes
  const messageFontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[settings.display?.messageFontSize || 'medium'];

  // Utility to determine text color based on background and theme
  const getUserBubbleStyle = () => {
    const bg = settings.display.themeColor || '#3B82F6';
    let textColor = '#fff';
    // If user selected white, force black text
    if (bg.toLowerCase() === '#fff' || bg.toLowerCase() === '#ffffff' || bg.toLowerCase() === 'white') {
      textColor = '#000';
    }
    // If in light mode, always use black text
    if (!isDarkMode) {
      textColor = '#000';
    }
    // If in dark mode, always use white text
    if (isDarkMode) {
      textColor = '#fff';
    }
    return {
      backgroundColor: bg,
      color: textColor
    };
  };

  const handleScroll = () => {
    if (!messageBox.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageBox.current;
    // Show button if user is more than 300px from bottom
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const scrollToBottom = () => {
    if (messageBox.current) {
      messageBox.current.scrollTo({
        top: messageBox.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Helper to get message status for current user's messages
  function getMessageStatus(msg) {
    if (!msg || !msg.sender || msg.sender._id !== user._id) return null;
    const others = (project.users || []).filter(u => u._id !== user._id).map(u => u._id);
    // Seen: at least one other user in readBy
    if (Array.isArray(msg.readBy) && msg.readBy.some(uid => uid !== user._id && others.includes(uid))) {
      return { label: 'Seen', icon: 'double-green' };
    }
    // Received: at least one other user in deliveredTo
    if (Array.isArray(msg.deliveredTo) && msg.deliveredTo.some(uid => uid !== user._id && others.includes(uid))) {
      return { label: 'Received', icon: 'double' };
    }
    // Sent: deliveredTo missing or only contains self
    return { label: 'Sent', icon: 'single' };
  }

  const projectId = project?._id;

  useEffect(() => {
    // Load settings from backend on mount
    if (projectId) {
      axios.get(`/api/projects/settings/${projectId}`)
        .then(res => {
          if (res.data && res.data.settings) {
            setSettings(prev => ({ ...prev, ...res.data.settings }));
            if (res.data.settings.display?.darkMode !== undefined) {
              setIsDarkMode(res.data.settings.display.darkMode);
            }
          }
        })
        .catch(() => { });
    }
  }, [projectId, project, setIsDarkMode]);

  // Save settings to backend whenever they change
  useEffect(() => {
    if (projectId) {
      axios.put(`/api/projects/settings/${projectId}`, { settings })
        .catch(() => { });
    }
  }, [settings, projectId]);

  useEffect(() => {
    setIsDarkMode(settings.display.darkMode);
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings.display.darkMode, setIsDarkMode]);

  const updateSettings = (category, key, value) => {
    const updated = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(updated);

    // If updating sidebar, sync with backend
    if (category === 'sidebar' && project?._id) {
      axios.put(`/api/projects/sidebar-settings/${project._id}`,
        { sidebar: updated.sidebar })
        .then(res => {
          if (res.data && res.data.sidebar) {
            setSettings({ ...updated, sidebar: res.data.sidebar });
          }
        })
        .catch(err => {
          logger.error('Failed to update sidebar settings:', err);
        });
    }
  };

  // Update settings when vimMode changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        vimMode,
      },
    }));
  }, [vimMode]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-transparent">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-100 dark:bg-gray-800">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg focus:outline-none"
              style={{ background: 'transparent', border: 'none' }}
            >
              <i className="ri-user-add-fill" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
              <span style={{ color: isDarkMode ? '#fff' : '#1f2937' }}>{t('addUsers')}</span>
            </button>
            {settings.display?.aiAssistant && (
              <button className="p-2" title={t('aiAssistant')} onClick={() => setIsAIModalOpen(true)}>
                <i className="ri-robot-2-line" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              title={t('settings')}
            >
              <i className="text-xl ri-settings-3-line" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
            </button>
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <i className="ri-search-eye-fill" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
              </button>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchMessages')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 p-2 text-sm text-gray-800 transition-all duration-300 bg-white border rounded dark:text-white dark:bg-gray-700"
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-2 top-2"
                >
                  <i className="ri-close-line" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
                </button>
              </div>
            )}
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <i className="ri-user-community-line" style={{ color: isDarkMode ? '#fff' : '#1f2937' }}></i>
            </button>
          </div>
        </header>
        <div
          ref={messageBox}
          onScroll={handleScroll}
          className="flex flex-col flex-grow gap-1 p-1 pb-20 overflow-auto pt-14 message-box scrollbar-hide bg-slate-50 dark:bg-gray-800"
        >
          {Object.keys(groupedMessages)
            .sort((a, b) => a.localeCompare(b))
            .map((groupLabel) => (
              <div key={groupLabel}>
                <div className="py-2 text-sm text-center text-gray-500 dark:text-gray-400">{groupLabel}</div>
                {groupedMessages[groupLabel].map((msg, idx) => (
                  <ErrorBoundary key={msg._id ? `${groupLabel}-${msg._id}` : `${groupLabel}-idx-${idx}`} fallbackMessage="Error rendering message">
                    <ChatMessage
                      msg={msg}
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
                    />
                  </ErrorBoundary>
                ))}
              </div>
            ))}
        </div>
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute z-20 flex items-center justify-center w-10 h-10 text-white transition-all bg-blue-600 rounded-full shadow-lg bottom-24 right-6 hover:bg-blue-700 animate-bounce"
          >
            <i className="text-xl ri-arrow-down-line"></i>
          </button>
        )}
        {replyingTo && (
          <div className="absolute z-20 flex items-center px-3 py-1 rounded-full shadow-md bottom-14 left-2 max-w-max bg-gradient-to-r from-blue-500 to-purple-500">
            <i className="mr-1 text-xs text-white ri-reply-line" />
            <span className="text-xs text-white">
              Replying to {replyingTo.sender?.firstName || 'Unknown'}
            </span>
            <button
              className="ml-2 focus:outline-none"
              onClick={() => setReplyingTo(null)}
            >
              <i className="text-xs text-white ri-close-line"></i>
            </button>
          </div>
        )}
        {typingUsers.size > 0 && (
          <div
            className="absolute text-sm text-gray-500 bottom-14 left-4 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="delay-100 animate-bounce">.</span>
                <span className="delay-200 animate-bounce">.</span>
              </div>
              {Array.from(typingUsers).map(userId => {
                const typingUser = project.users.find(u => u._id === userId);
                return typingUser?.firstName || 'Unknown';
              }).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}
        <div className="absolute bottom-0 flex w-full bg-white inputField dark:bg-gray-800">
          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (settings.behavior.enterToSend) {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              } else {
                if (e.key === 'Enter' && e.shiftKey) {
                  // allow new line
                } else if (e.key === 'Enter') {
                  // just add new line
                }
              }
            }}
            className="flex-grow p-2 px-4 bg-transparent border-none outline-none dark:text-white"
            type="text"
            placeholder="Enter message"
          />
          <button
            onClick={send}
            style={{ backgroundColor: settings.display.themeColor || '#3B82F6' }}
            className="px-5 text-white hover:brightness-90"
            title={t('send')}
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 dark:bg-gray-800 absolute transition-all ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
            } top-0`}
        >
          <header className="flex items-center justify-between p-2 px-4 bg-slate-200 dark:bg-gray-700">
            <h1 className="text-lg font-semibold dark:text-white">Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="flex flex-col gap-2 users">
            {project.users &&
              project.users.map((u) => (
                <div key={u._id} className="flex items-center gap-2 p-2 cursor-pointer user hover:bg-slate-200 dark:hover:bg-gray-700">
                  <Avatar
                    firstName={u.firstName}
                    className="w-12 h-12 text-base"
                  />
                  <h1 className="text-lg font-semibold dark:text-white">{u.firstName}</h1>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 right">
        <div
          className="h-full explorer bg-slate-200 dark:bg-gray-500"
          style={{
            maxWidth: settings.sidebar?.sidebarWidth || 240,
            minWidth: settings.sidebar?.sidebarWidth || 240,
            transition: 'max-width 0.2s, min-width 0.2s',
            position: settings.sidebar?.pinSidebar ? 'sticky' : 'relative',
            left: 0,
            top: 0,
            zIndex: settings.sidebar?.pinSidebar ? 20 : 'auto',
            boxShadow: settings.sidebar?.pinSidebar ? '2px 0 8px rgba(0,0,0,0.08)' : undefined,
          }}
        >
          <div className="flex flex-col w-full">
            {/* Options Button */}
            <button
              onClick={() => setShowOptionsModal(true)}
              className="flex items-center gap-2 p-2 px-4 mb-2 font-semibold text-white transition-all duration-200 bg-blue-600 rounded shadow hover:bg-blue-700"
              style={{ marginTop: '10px', marginBottom: '10px' }}
            >
              <i className="text-lg ri-settings-3-line"></i>
              {t('options')}
            </button>
            {/* Show File Tree Option */}
            {settings.sidebar?.showFileTree !== false && (
              <div className="file-tree">
                {fileTree && Object.keys(fileTree).length > 0 ? (
                  Object.keys(fileTree).map((file) => (
                    <button
                      key={file}
                      onClick={() => {
                        setCurrentFile(file);
                        setOpenFiles([...new Set([...openFiles, file])]);
                      }}
                      className="flex items-center w-full gap-2 p-2 px-4 cursor-pointer tree-element hover:bg-slate-400 dark:hover:bg-gray-600 bg-slate-300 dark:bg-gray-700 dark:text-white"
                    >
                      <FileIcon fileName={file} />
                      <p className="text-lg font-semibold">{file}</p>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-300 p-4">No files found in this project.</div>
                )}
              </div>
            )}
            {/* Show Collaborators Option */}
            {settings.sidebar?.showCollaborators && project.users && (
              <div className="collaborators-list mt-2 mb-2 px-2 py-2 bg-slate-100 dark:bg-gray-700 rounded-lg shadow">
                <div className="text-sm font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
                  <i className="ri-user-add-fill text-blue-600 dark:text-blue-400"></i>
                  {t('collaborators')}
                </div>
                <div className="flex flex-col gap-2">
                  {project.users.map((u) => (
                    <div key={u._id} className="flex items-center gap-3 p-2 rounded cursor-pointer user hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                      <Avatar firstName={u.firstName} className="w-8 h-8 text-base" />
                      <span className="text-base font-medium" style={{ color: isDarkMode ? '#fff' : '#222' }}>{u.firstName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow h-full code-editor shrink">
          <div className="flex justify-between w-full top">
            <div className="flex files">
              {openFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 dark:bg-gray-700 dark:text-white ${currentFile === file ? "bg-slate-400 dark:bg-gray-600" : ""
                    }`}
                >
                  <p className="text-lg font-semibold dark:text-white">{file}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2 actions">
              <button
                onClick={() => runProject(showToast)}
                disabled={isRunning}
                style={{ backgroundColor: settings.display.themeColor || '#3B82F6', color: '#fff' }}
                className={`p-2 px-4 rounded hover:brightness-90 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRunning ? 'Running...' : t('run')}
              </button>
            </div>
          </div>
          <div className="flex flex-grow max-w-full bottom shrink" style={{ overflow: 'hidden', minHeight: 0 }}>
            <div className="flex-grow h-full code-editor-area bg-slate-50 dark:bg-gray-900 min-h-[200px] border border-blue-200 relative flex flex-col" style={{ minWidth: '0', maxWidth: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
              {fileTree && currentFile && fileTree[currentFile]?.file?.contents?.length > 0 ? (
                <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                  {vimMode ? (
                    <VimCodeEditor
                      value={fileTree[currentFile].file.contents}
                      onChange={(value) => {
                        setFileTree((prev) => ({
                          ...prev,
                          [currentFile]: {
                            ...prev[currentFile],
                            file: { ...prev[currentFile].file, contents: value },
                          },
                        }));
                      }}
                      isDarkMode={isDarkMode}
                      fontSize={settings.display.messageFontSize === 'large' ? '1.2rem' : settings.display.messageFontSize === 'small' ? '0.9rem' : '1rem'}
                      showOptionsModal={showOptionsModal}
                      onCloseOptionsModal={() => setShowOptionsModal(false)}
                    />
                  ) : (
                    <CodeMirror
                      className={settings.display.syntaxHighlighting === false && isDarkMode ? 'syntax-off-dark' : ''}
                      value={fileTree[currentFile].file.contents}
                      theme={settings.display.syntaxHighlighting === false ? undefined : (isDarkMode ? 'dark' : 'light')}
                      extensions={
                        settings.display.syntaxHighlighting === false
                          ? []
                          : [javascript()]
                      }
                      onChange={(value) => {
                        setFileTree((prev) => ({
                          ...prev,
                          [currentFile]: {
                            ...prev[currentFile],
                            file: { ...prev[currentFile].file, contents: value },
                          },
                        }));
                      }}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                        highlightActiveLineGutter: true,
                      }}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: settings.display.messageFontSize === 'large' ? '1.2rem' : settings.display.messageFontSize === 'small' ? '0.9rem' : '1rem',
                        background: settings.display.syntaxHighlighting === false && isDarkMode
                          ? '#181e29'
                          : isDarkMode
                            ? '#111827'
                            : 'white',
                        color: settings.display.syntaxHighlighting === false && isDarkMode ? '#fff' : undefined,
                        height: '100%',
                        minHeight: 0,
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 italic select-none" style={{ padding: '2rem' }}>
                  {(!currentFile || !fileTree[currentFile]) ? t('noFileSelected') : t('noCode')}
                </div>
              )}
            </div>
          </div>
        </div>
        {iframeUrl && webContainer && (
          <div className="flex flex-col h-full min-w-96">
            <div className="address-bar">
              <input
                type="text"
                onChange={(e) => {
                  const safeUrl = sanitizeIframeUrl(e.target.value);
                  if (safeUrl !== null) {
                    setIframeUrl(safeUrl);
                  }
                }}
                value={iframeUrl || ''}
                className="w-full p-2 px-4 bg-slate-200 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <iframe
              src={iframeUrl}
              className="w-full h-full bg-white"
              style={{
                backgroundColor: "white"
              }}
              onLoad={(e) => {
                try {
                  const doc = e.target.contentDocument;
                  if (doc) {
                    const style = doc.createElement('style');
                    style.textContent = `
                      body { 
                        color: #000 !important;
                        background-color: #fff !important;
                      }
                      * {
                        color: #000 !important;
                      }
                    `;
                    doc.head.appendChild(style);
                  }
                } catch {
                  /* Iframe content access might be restricted by CORS */
                }
              }}
            />
          </div>
        )}
      </section>

      <AddCollaboratorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        selectedUserId={selectedUserId}
        handleUserClick={handleUserClick}
        addCollaborators={addCollaborators}
        t={t}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiInput("");
          setAiResponse("");
        }}
        aiInput={aiInput}
        setAiInput={setAiInput}
        aiResponse={aiResponse}
        aiLoading={aiLoading}
        handleAISend={handleAISend}
      />

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        settings={settings}
        updateSettings={updateSettings}
        vimMode={vimMode}
        setVimMode={setVimMode}
        modalPosition={modalPosition}
        setModalPosition={setModalPosition}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragOffset={dragOffset}
        setDragOffset={setDragOffset}
        settingsModalRef={settingsModalRef}
        t={t}
      />
    </main>
  )
}

Project.propTypes = {
  children: PropTypes.node,
};

export default Project