import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import { getWebContainer } from '../config/webContainer'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import FileIcon from '../components/FileIcon';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import PropTypes from 'prop-types';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vim } from '@replit/codemirror-vim';

function deduplicateMessages(messages) {
  const seen = new Set();
  return messages.filter(msg => {
    if (!msg._id) return true;
    if (seen.has(msg._id)) return false;
    seen.add(msg._id);
    return true;
  });
}

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)
  React.useEffect(() => {
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

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const getGroupLabel = (date) => {
  const today = new Date()
  if (isSameDay(date, today)) return 'Today'

  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString()
}

const groupMessagesByDate = (messagesArr) => {
  const groups = {}
  messagesArr.forEach((msg) => {
    const d = new Date(msg.createdAt)
    const label = getGroupLabel(d)
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(msg)
  })
  return groups
}

// Utility to normalize fileTree structure
function normalizeFileTree(tree) {
  if (!tree || typeof tree !== 'object') return {};
  const normalized = {};
  for (const [key, value] of Object.entries(tree)) {
    if (value && typeof value === 'object' && 'file' in value && typeof value.file.contents === 'string') {
      normalized[key] = value;
    } else if (typeof value === 'string') {
      // If value is just a string, wrap it
      normalized[key] = { file: { contents: value } };
    } else {
      // Fallback: skip or handle as needed
    }
  }
  return normalized;
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
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('projectSettings');
    const defaultSettings = {
      display: {
        darkMode: isDarkMode,
      },
    };
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('display');
  const [messageEmojiPickers, setMessageEmojiPickers] = useState({});
  const [vimMode, setVimMode] = useState(() => settings.display?.vimMode || false);

  const toggleEmojiPicker = (messageId) => {
    setMessageEmojiPickers(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleReaction = (messageId, emoji, userId) => {
    const message = messages.find(m => m._id === messageId);
    if (message.sender._id === userId) {
      return;
    }

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
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId)
      })
      .then((res) => {
        console.log(res.data)
        setIsModalOpen(false)
      })
      .catch((err) => console.log(err))
  }

  const send = () => {
    if (!message.trim()) return;
    const payload = {
      message,
      sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null,
      googleApiKey: user.googleApiKey // send user's Gemini key
    };
    sendMessage("project-message", payload);
    setMessage("");
    setReplyingTo(null);
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendMessage('typing', { userId: user._id, projectId: project._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendMessage('stop-typing', { userId: user._id, projectId: project._id });
    }, 1000);
  };

  useEffect(() => {
    if (messages.length && messageBox.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg._id) {
        sendMessage("message-read", { messageId: lastMsg._id, userId: user._id })
      }
    }
  }, [messages, user])

  useEffect(() => {
    if (window.__webcontainerBooted) return;
    window.__webcontainerBooted = true;
    initializeSocket(project._id)
    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container)
        console.log("container started")
      })
    }
    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      console.log(res.data.project)
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })
    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users)
      })
      .catch((err) => console.log(err))
  }, [webContainer, project._id, location.state.project._id])

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
            axios.put('/projects/update-file-tree', {
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
            return [
              ...prev,
              {
                ...data,
                message: aiResponse.text || data.message
              }
            ];
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
        return [...prev, data];
      });
    }

    receiveMessage("project-message", handleIncomingMessage)
  }, [webContainer, project._id])

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

    receiveMessage('typing', handleUserTyping);
    receiveMessage('stop-typing', handleStopTyping);

    return () => {
      receiveMessage('typing', null);
      receiveMessage('stop-typing', null);
    };
  }, [user._id]);

  useEffect(() => {
    const handleReactionUpdate = (updatedMessage) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    receiveMessage("message-reaction", handleReactionUpdate);
  }, []);

  // Fix: Deduplicate messages on every update
  useEffect(() => {
    setMessages(prev => deduplicateMessages(prev));
  }, [messages.length]);

  const filteredMessages = searchTerm
    ? messages.filter((msg) => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  // Fix: define groupedMessages before return
  const groupedMessages = groupMessagesByDate(filteredMessages);

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

  const renderMessage = (msg) => {
    const isCurrentUser =
      msg.sender &&
      typeof msg.sender === "object" &&
      msg.sender._id &&
      msg.sender._id.toString() === user._id.toString()

    const parentMsg = msg.parentMessageId && messages.find((m) => m._id === msg.parentMessageId)

    let reactionGroups = {};
    if (msg.reactions) {
      msg.reactions.forEach(r => {
        if (!reactionGroups[r.emoji]) {
          reactionGroups[r.emoji] = [];
        }
        if (!reactionGroups[r.emoji].includes(r.userId)) {
          reactionGroups[r.emoji].push(r.userId);
        }
      });
    }

    return (
      <motion.div
        key={msg._id}
        initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}
      >
        {msg.parentMessageId && (
          <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
            Replying to: {parentMsg ? (typeof parentMsg.sender === "object" ? parentMsg.sender.firstName : parentMsg.sender) : "Unknown"}
          </div>
        )}
        <div className="flex items-start gap-2">
          {!isCurrentUser && (
            <Avatar 
              firstName={typeof msg.sender === "object" ? msg.sender.firstName : undefined}
              className="w-8 h-8 text-sm"
            />
          )}
          <div
            className={`flex flex-col p-2 max-w-xs break-words ${bubbleRoundnessClass} ${messageFontSizeClass} ${isCurrentUser ? "" : "bg-white text-gray-800 shadow"}`}
            style={isCurrentUser ? getUserBubbleStyle() : {}}
          >
            {!isCurrentUser && (
              <small className={`mb-1 font-bold text-gray-700 ${messageFontSizeClass}`}>
                {typeof msg.sender === "object" ? msg.sender.firstName : msg.sender}
              </small>
            )}
            <div className={`whitespace-pre-wrap ${messageFontSizeClass}`}>
              {msg.sender && msg.sender._id === "Chatraj" ? (
                <div className={`p-2 rounded ${settings.display.syntaxHighlighting === false 
  ? (isDarkMode ? "bg-gray-900 text-white" : "bg-slate-200 text-black") 
  : "text-white bg-slate-950"} ${messageFontSizeClass}`}>
                  <Markdown options={{
                    overrides: {
                      code: settings.display.syntaxHighlighting === false
                        ? {
                            component: (props) => <code style={{whiteSpace:'pre-wrap',wordBreak:'break-word',overflowWrap:'break-word',display:'block',background:'none',color:'inherit'}}>{props.children}</code>
                          }
                        : SyntaxHighlightedCode
                    }
                  }}>
                    {(() => {
                      try {
                        const parsedMessage = JSON.parse(msg.message);
                        return parsedMessage.text || msg.message;
                      } catch {
                        return msg.message;
                      }
                    })()}
                  </Markdown>
                </div>
              ) : (
                <p className={messageFontSizeClass}>{msg.message}</p>
              )}
            </div>
          </div>
          {isCurrentUser && (
            <Avatar 
              firstName={user.firstName}
              className="w-8 h-8 text-sm"
              style={getUserBubbleStyle()}
            />
          )}
        </div>
        <div className="relative group">
          <div className="flex items-center gap-2 mt-1">
            <small className="text-[10px] text-gray-600">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </small>
            <div className="relative">
              {!isCurrentUser && (
                <button
                  className="p-1 text-xs text-gray-600 rounded opacity-0 dark:text-gray-400 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleEmojiPicker(msg._id)}
                >
                  <i className="text-base ri-emotion-line"></i>
                </button>
              )}
              <EmojiPicker
                isOpen={messageEmojiPickers[msg._id]}
                setIsOpen={(isOpen) => {
                  setMessageEmojiPickers(prev => ({
                    ...prev,
                    [msg._id]: isOpen
                  }));
                }}
                isCurrentUser={isCurrentUser}
                onSelect={(emoji) => {
                  if (msg._id && !isCurrentUser) {
                    handleReaction(msg._id, emoji, user._id);
                  }
                }}
              />
            </div>
            {Object.entries(reactionGroups).map(([emoji, users]) => {
              if (users.length === 0) return null;
              
              return (
                <button
                  key={emoji}
                  className={`text-xs px-2 py-1 rounded-full ${
                    users.includes(user._id) 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  title={users.map(userId => {
                    const reactingUser = project.users.find(u => u._id === userId);
                    return reactingUser ? reactingUser.firstName : 'Unknown';
                  }).join(', ')}
                >
                  {emoji} {users.length}
                </button>
              );
            })}
            <button
              onClick={() => setReplyingTo(msg)}
              className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              Reply
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const projectId = project?._id;

  useEffect(() => {
    // Load settings from backend on mount
    if (projectId) {
      axios.get(`/projects/settings/${projectId}`)
        .then(res => {
          if (res.data && res.data.settings) {
            setSettings(prev => ({ ...prev, ...res.data.settings }));
            if (res.data.settings.display?.darkMode !== undefined) {
              setIsDarkMode(res.data.settings.display.darkMode);
            }
          }
        })
        .catch(() => {});
    }
  }, [projectId, project, setIsDarkMode]);

  // Save settings to backend whenever they change
  useEffect(() => {
    if (projectId) {
      axios.put(`/projects/settings/${projectId}`, { settings })
        .catch(() => {});
    }
    localStorage.setItem('projectSettings', JSON.stringify(settings));
  }, [settings, projectId, project]);

  useEffect(() => {
    localStorage.setItem('projectSettings', JSON.stringify(settings));
    setIsDarkMode(settings.display.darkMode);
    document.documentElement.classList.toggle('dark', settings.display.darkMode);
  }, [settings, setIsDarkMode]);

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
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
    <main className="flex w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-100 dark:bg-gray-800">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg"
            >
              <i className="text-gray-800 ri-user-add-fill dark:text-white"></i>
              <span className="text-gray-800 dark:text-white">Add Users</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-800 transition-colors rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Settings"
            >
              <i className="text-xl ri-settings-3-line"></i>
            </button>
            {!showSearch ? (
              <button 
                onClick={() => setShowSearch(true)} 
                className="p-2 text-gray-800 transition-colors rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <i className="text-gray-800 ri-search-eye-fill dark:text-white"></i>
              </button>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 p-2 text-sm text-gray-800 transition-all duration-300 bg-white border rounded dark:text-white dark:bg-gray-700"
                />
                <button 
                  onClick={() => setShowSearch(false)} 
                  className="absolute text-gray-800 right-2 top-2 dark:text-white"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
              className="p-2 text-gray-800 transition-colors rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <i className="text-gray-800 ri-user-community-line dark:text-white"></i>
            </button>
          </div>
        </header>
        <div 
          ref={messageBox} 
          className="flex flex-col flex-grow gap-1 p-1 pb-20 overflow-auto pt-14 message-box scrollbar-hide bg-slate-50 dark:bg-gray-800"
        >
          {Object.keys(groupedMessages)
            .sort((a, b) => a.localeCompare(b))
            .map((groupLabel) => (
              <div key={groupLabel}>
                <div className="py-2 text-sm text-center text-gray-500 dark:text-gray-400">{groupLabel}</div>
                {groupedMessages[groupLabel].map((msg) => (
                  <React.Fragment key={msg._id}>{renderMessage(msg)}</React.Fragment>
                ))}
              </div>
            ))}
        </div>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
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
          </motion.div>
        )}
        <div className="absolute bottom-0 flex w-full bg-white inputField dark:bg-gray-800">
          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                send()
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
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 dark:bg-gray-800 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
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
        <div className="h-full explorer max-w-64 min-w-52 bg-slate-200 dark:bg-gray-500">
          <div className="w-full file-tree">
            {Object.keys(fileTree).map((file) => (
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
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-grow h-full code-editor shrink">
          <div className="flex justify-between w-full top">
            <div className="flex files">
              {openFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 dark:bg-gray-700 dark:text-white ${
                    currentFile === file ? "bg-slate-400 dark:bg-gray-600" : ""
                  }`}
                >
                  <p className="text-lg font-semibold dark:text-white">{file}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2 actions">
              <button
                onClick={async () => {
                  if (!webContainer) {
                    alert("WebContainer is not ready yet.");
                    return;
                  }
                  try {
                    await webContainer.mount({
                      'package.json': {
                        file: {
                          contents: JSON.stringify({
                            name: 'express-app',
                            version: '1.0.0',
                            scripts: {
                              start: 'node app.js'
                            },
                            dependencies: {
                              express: '^4.18.2'
                            }
                          })
                        }
                      },
                      ...fileTree
                    });

                    if (runProcess) {
                      await runProcess.kill();
                    }

                    let installSuccess = false;
                    let retries = 3;

                    while (!installSuccess && retries > 0) {
                      try {
                        const installProcess = await webContainer.spawn('npm', ['install']);
                        const installExitCode = await new Promise(resolve => {
                          installProcess.output.pipeTo(new WritableStream({
                            write(chunk) {
                              console.log('Install output:', chunk);
                            }
                          }));
                          installProcess.exit.then(resolve);
                        });

                        if (installExitCode === 0) {
                          installSuccess = true;
                          console.log('Dependencies installed successfully');
                        }
                      } catch (err) {
                        console.log(`Install attempt failed, ${retries - 1} retries left:`, err);
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, 1000));
                      }
                    }

                    if (!installSuccess) {
                      throw new Error('Failed to install dependencies after multiple attempts');
                    }

                    const tempRunProcess = await webContainer.spawn('npm', ['start']);
                    
                    tempRunProcess.output.pipeTo(new WritableStream({
                      write(chunk) {
                        console.log('Server output:', chunk);
                      }
                    }));

                    tempRunProcess.exit.then(code => {
                      if (code !== 0) {
                        console.error(`Process exited with code ${code}`);
                      }
                    });

                    setRunProcess(tempRunProcess);

                    webContainer.on('server-ready', (port, url) => {
                      console.log('Server ready on:', url);
                      setIframeUrl(url);
                    });

                  } catch (error) {
                    console.error('Error running project:', error);
                    alert(`Failed to run project: ${error.message}`);
                  }
                }}
                style={{ backgroundColor: settings.display.themeColor || '#3B82F6', color: '#fff' }}
                className="p-2 px-4 rounded hover:brightness-90"
              >
                run
              </button>
            </div>
          </div>
          <div className="flex flex-grow max-w-full bottom shrink" style={{overflow:'hidden', minHeight:0}}>
            <div className="flex-grow h-full code-editor-area bg-slate-50 dark:bg-gray-900 min-h-[200px] border border-blue-200 relative flex flex-col" style={{minWidth:'0',maxWidth:'100vw',overflow:'hidden',display:'flex',flexDirection:'column', minHeight:0, flex:1}}>
              {/* Debug info for production troubleshooting (remove after fix) */}
              {typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && (
                <div style={{position:'absolute',top:0,right:0,zIndex:10,background:'#fff8',color:'#333',fontSize:'10px',padding:'2px 4px',borderRadius:'0 0 0 4px'}}>
                  <div>currentFile: {String(currentFile)}</div>
                  <div>fileTree keys: {Object.keys(fileTree).join(', ')}</div>
                  <div>fileTree[currentFile]?.file?.contents length: {fileTree[currentFile]?.file?.contents?.length ?? 'N/A'}</div>
                </div>
              )}
              {fileTree && currentFile && fileTree[currentFile] && fileTree[currentFile].file && typeof fileTree[currentFile].file.contents === 'string' && fileTree[currentFile].file.contents.length > 0 ? (
                <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                  <CodeMirror
                    className={settings.display.syntaxHighlighting === false && isDarkMode ? "syntax-off-dark" : ""}
                    value={fileTree[currentFile].file.contents}
                    theme={settings.display.syntaxHighlighting === false ? undefined : (isDarkMode ? 'dark' : 'light')}
                    extensions={
                      settings.display.syntaxHighlighting === false
                        ? []
                        : [
                            javascript(),
                            vimMode ? vim() : [],
                          ]
                    }
                    onChange={(value) => {
                      const ft = { ...fileTree, [currentFile]: { file: { contents: value } } }
                      setFileTree(ft)
                    }}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: true,
                      highlightActiveLineGutter: true,
                    }}
                    style={{
                      fontFamily: settings.display.editorFont || 'monospace',
                      fontSize: settings.display.messageFontSize === 'large' ? '1.2rem' : settings.display.messageFontSize === 'small' ? '0.9rem' : '1rem',
                      background: settings.display.syntaxHighlighting === false && isDarkMode ? '#181e29' : (isDarkMode ? '#111827' : 'white'),
                      color: settings.display.syntaxHighlighting === false && isDarkMode ? '#fff' : undefined,
                      height: '100%',
                      minHeight: 0,
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 italic select-none" style={{padding:'2rem'}}>
                  {(!currentFile || !fileTree[currentFile]) ? 'No file selected.' : 'No code to display.'}
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
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
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
                  console.log("Unable to access iframe content");
                }
              }}
            />
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-full p-4 bg-white rounded-md w-96">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-900">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="flex flex-col gap-2 mb-16 overflow-auto users-list max-h-96">
              {users.map((u) => (
                <div
                  key={u._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).includes(u._id) ? "bg-slate-200" : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(u._id)}
                >
                  <Avatar 
                    firstName={u.firstName}
                    className="w-12 h-12 text-base"
                  />
                  <h1 className="text-lg font-semibold text-gray-900">{u.firstName}</h1>
                </div>
              ))}
            </div>
            <button 
              onClick={addCollaborators} 
              className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-blue-600 rounded-md hover:bg-blue-700 bottom-4 left-1/2"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (copied and adapted from ChatRaj) */}
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
              className="fixed top-24 left-4 z-50 w-[320px] bg-white rounded-lg shadow-xl dark:bg-gray-800"
              style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'hidden' }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <i className="text-xl ri-close-line"></i>
                </button>
              </div>
              <div className="flex px-6 pt-4 pb-2 space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveSettingsTab('display')} className={`px-3 py-1 rounded ${activeSettingsTab === 'display' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Display</button>
                <button onClick={() => setActiveSettingsTab('behavior')} className={`px-3 py-1 rounded ${activeSettingsTab === 'behavior' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Behavior</button>
                <button onClick={() => setActiveSettingsTab('accessibility')} className={`px-3 py-1 rounded ${activeSettingsTab === 'accessibility' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Accessibility</button>
                <button onClick={() => setActiveSettingsTab('privacy')} className={`px-3 py-1 rounded ${activeSettingsTab === 'privacy' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Privacy</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-6 py-4 custom-scrollbar">
                {activeSettingsTab === 'display' && (
                  <div className="space-y-4">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="darkModeSwitch" className="text-sm font-medium text-black dark:text-white">Dark Mode</label>
                      <button
                        id="darkModeSwitch"
                        onClick={() => updateSettings('display', 'darkMode', !settings.display.darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {/* Theme Color */}
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Theme Color</label>
                      <input
                        type="color"
                        value={settings.display.themeColor || '#3B82F6'}
                        onChange={e => updateSettings('display', 'themeColor', e.target.value)}
                        className="w-12 h-8 p-0 bg-transparent border-0"
                      />
                    </div>
                    {/* Chat Bubble Roundness */}
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Chat Bubble Roundness</label>
                      <select
                        value={settings.display.bubbleRoundness || 'large'}
                        onChange={e => updateSettings('display', 'bubbleRoundness', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>
                    {/* Message Font Size */}
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Message Font Size</label>
                      <select
                        value={settings.display.messageFontSize || 'medium'}
                        onChange={e => updateSettings('display', 'messageFontSize', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    {/* Enable Syntax Highlighting */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="syntaxHighlightingSwitch" className="text-sm font-medium text-black dark:text-white">Enable Syntax Highlighting</label>
                      <button
                        id="syntaxHighlightingSwitch"
                        onClick={() => updateSettings('display', 'syntaxHighlighting', !settings.display.syntaxHighlighting)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.syntaxHighlighting ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.syntaxHighlighting ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {/* More useful options */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Show Avatars</label>
                      <button
                        onClick={() => updateSettings('display', 'showAvatars', !settings.display.showAvatars)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showAvatars ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showAvatars ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Show Timestamps</label>
                      <button
                        onClick={() => updateSettings('display', 'showTimestamps', !settings.display.showTimestamps)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showTimestamps ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showTimestamps ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable AI Assistant</label>
                      <button
                        onClick={() => updateSettings('display', 'aiAssistant', !settings.display.aiAssistant)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.aiAssistant ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.aiAssistant ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Notifications</label>
                      <button
                        onClick={() => updateSettings('display', 'notifications', !settings.display.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Editor Font Family</label>
                      <select
                        value={settings.display.editorFont || 'monospace'}
                        onChange={e => updateSettings('display', 'editorFont', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <option value="monospace">Monospace</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="serif">Serif</option>
                      </select>
                    </div>
                    {/* Vim Mode (newly added) */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Vim Mode (Editor)</label>
                      <button
                        onClick={() => setVimMode(v => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vimMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vimMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                )}
                {activeSettingsTab === 'behavior' && (
                  <div className="space-y-6">
                    {/* Auto Scroll */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Auto Scroll</label>
                      <button
                        onClick={() => updateSettings('behavior', 'autoScroll', !settings.behavior?.autoScroll)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior?.autoScroll ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior?.autoScroll ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {/* Auto Save */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Auto-Save</label>
                      <button
                        onClick={() => updateSettings('behavior', 'autoSave', !settings.behavior?.autoSave)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior?.autoSave ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior?.autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Auto-Save Interval (seconds)</label>
                      <input
                        type="number"
                        min="1"
                        value={settings.behavior?.autoSaveInterval || 30}
                        onChange={e => updateSettings('behavior', 'autoSaveInterval', Number(e.target.value))}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Auto Formatting */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Auto-Formatting</label>
                      <button
                        onClick={() => updateSettings('behavior', 'autoFormatting', !settings.behavior?.autoFormatting)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior?.autoFormatting ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior?.autoFormatting ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Auto-Formatting Rules</label>
                      <input
                        type="text"
                        value={settings.behavior?.autoFormattingRules || ''}
                        onChange={e => updateSettings('behavior', 'autoFormattingRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
                {activeSettingsTab === 'accessibility' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Language</label>
                      <select
                        value={settings.accessibility?.language || 'en-US'}
                        onChange={e => updateSettings('accessibility', 'language', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="hi-IN">हिंदी (Hindi)</option>
                        <option value="es-ES">Español (Spanish)</option>
                        <option value="fr-FR">Français (French)</option>
                        <option value="de-DE">Deutsch (German)</option>
                        <option value="ja-JP">日本語 (Japanese)</option>
                      </select>
                    </div>
                  </div>
                )}
                {activeSettingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Save Chat History</label>
                      <button
                        onClick={() => updateSettings('privacy', 'saveHistory', !settings.privacy?.saveHistory)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacy?.saveHistory ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy?.saveHistory ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                )}
                {/* --- Advanced Code Options --- */}
                {activeSettingsTab === 'display' && (
                  <div className="mt-8 space-y-6">
                    <h3 className="text-base font-semibold text-black dark:text-white">Advanced Code Options</h3>
                    {/* Code Linting */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Linting</label>
                      <button
                        onClick={() => updateSettings('display', 'codeLinting', !settings.display.codeLinting)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeLinting ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeLinting ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Linting Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeLintingRules || ''}
                        onChange={e => updateSettings('display', 'codeLintingRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Completion */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Completion</label>
                      <button
                        onClick={() => updateSettings('display', 'codeCompletion', !settings.display.codeCompletion)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeCompletion ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeCompletion ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Completion Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeCompletionRules || ''}
                        onChange={e => updateSettings('display', 'codeCompletionRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Suggestions */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Suggestions</label>
                      <button
                        onClick={() => updateSettings('display', 'codeSuggestions', !settings.display.codeSuggestions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeSuggestions ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeSuggestions ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Suggestions Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeSuggestionsRules || ''}
                        onChange={e => updateSettings('display', 'codeSuggestionsRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Refactoring */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Refactoring</label>
                      <button
                        onClick={() => updateSettings('display', 'codeRefactoring', !settings.display.codeRefactoring)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeRefactoring ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeRefactoring ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Refactoring Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeRefactoringRules || ''}
                        onChange={e => updateSettings('display', 'codeRefactoringRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Navigation */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Navigation</label>
                      <button
                        onClick={() => updateSettings('display', 'codeNavigation', !settings.display.codeNavigation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeNavigation ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeNavigation ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Navigation Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeNavigationRules || ''}
                        onChange={e => updateSettings('display', 'codeNavigationRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Search */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Search</label>
                      <button
                        onClick={() => updateSettings('display', 'codeSearch', !settings.display.codeSearch)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeSearch ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeSearch ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Search Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeSearchRules || ''}
                        onChange={e => updateSettings('display', 'codeSearchRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Debugging */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Debugging</label>
                      <button
                        onClick={() => updateSettings('display', 'codeDebugging', !settings.display.codeDebugging)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeDebugging ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeDebugging ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Debugging Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeDebuggingRules || ''}
                        onChange={e => updateSettings('display', 'codeDebuggingRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Profiling */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Profiling</label>
                      <button
                        onClick={() => updateSettings('display', 'codeProfiling', !settings.display.codeProfiling)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeProfiling ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeProfiling ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Profiling Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeProfilingRules || ''}
                        onChange={e => updateSettings('display', 'codeProfilingRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Testing */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Testing</label>
                      <button
                        onClick={() => updateSettings('display', 'codeTesting', !settings.display.codeTesting)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeTesting ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeTesting ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Testing Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeTestingRules || ''}
                        onChange={e => updateSettings('display', 'codeTestingRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Deployment */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Deployment</label>
                      <button
                        onClick={() => updateSettings('display', 'codeDeployment', !settings.display.codeDeployment)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeDeployment ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeDeployment ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Deployment Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeDeploymentRules || ''}
                        onChange={e => updateSettings('display', 'codeDeploymentRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Versioning */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Versioning</label>
                      <button
                        onClick={() => updateSettings('display', 'codeVersioning', !settings.display.codeVersioning)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeVersioning ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeVersioning ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Versioning Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeVersioningRules || ''}
                        onChange={e => updateSettings('display', 'codeVersioningRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {/* Code Collaboration */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-black dark:text-white">Enable Code Collaboration</label>
                      <button
                        onClick={() => updateSettings('display', 'codeCollaboration', !settings.display.codeCollaboration)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.codeCollaboration ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.codeCollaboration ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Code Collaboration Rules</label>
                      <input
                        type="text"
                        value={settings.display.codeCollaborationRules || ''}
                        onChange={e => updateSettings('display', 'codeCollaborationRules', e.target.value)}
                        className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}

export default Project