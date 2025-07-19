// --- Language Translations (fresh logic for Project.jsx) ---
const PROJECT_TRANSLATIONS = {
  'en-US': {
    addUsers: 'Add Users',
    collaborators: 'Collaborators',
    options: 'Options',
    run: 'Run',
    noFileSelected: 'No file selected.',
    noCode: 'No code to display.',
    settings: 'Settings',
    language: 'Language',
    aiAssistant: 'AI Assistant',
    replyTo: 'Replying to',
    send: 'Send',
    searchMessages: 'Search messages...',
    selectUser: 'Select User',
    addCollaborators: 'Add Collaborators',
    previewOptions: 'Preview Options',
    editorSettings: 'Editor Settings (see main settings for more)',
  },
  'hi-IN': {
    addUsers: 'यूज़र जोड़ें',
    collaborators: 'सहयोगी',
    options: 'विकल्प',
    run: 'चलाएँ',
    noFileSelected: 'कोई फ़ाइल चयनित नहीं है।',
    noCode: 'कोड उपलब्ध नहीं है।',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    aiAssistant: 'एआई सहायक',
    replyTo: 'को उत्तर दे रहे हैं',
    send: 'भेजें',
    searchMessages: 'संदेश खोजें...',
    selectUser: 'यूज़र चुनें',
    addCollaborators: 'सहयोगी जोड़ें',
    previewOptions: 'पूर्वावलोकन विकल्प',
    editorSettings: 'संपादक सेटिंग्स (अधिक के लिए मुख्य सेटिंग्स देखें)',
  },
  'es-ES': {
    addUsers: 'Agregar usuarios',
    collaborators: 'Colaboradores',
    options: 'Opciones',
    run: 'Ejecutar',
    noFileSelected: 'Ningún archivo seleccionado.',
    noCode: 'No hay código para mostrar.',
    settings: 'Configuración',
    language: 'Idioma',
    aiAssistant: 'Asistente de IA',
    replyTo: 'Respondiendo a',
    send: 'Enviar',
    searchMessages: 'Buscar mensajes...',
    selectUser: 'Seleccionar usuario',
    addCollaborators: 'Agregar colaboradores',
    previewOptions: 'Opciones de vista previa',
    editorSettings: 'Configuración del editor (ver configuración principal para más)',
  },
  'fr-FR': {
    addUsers: 'Ajouter des utilisateurs',
    collaborators: 'Collaborateurs',
    options: 'Options',
    run: 'Exécuter',
    noFileSelected: 'Aucun fichier sélectionné.',
    noCode: 'Aucun code à afficher.',
    settings: 'Paramètres',
    language: 'Langue',
    aiAssistant: 'Assistant IA',
    replyTo: 'En réponse à',
    send: 'Envoyer',
    searchMessages: 'Rechercher des messages...',
    selectUser: 'Sélectionner un utilisateur',
    addCollaborators: 'Ajouter des collaborateurs',
    previewOptions: 'Options d’aperçu',
    editorSettings: 'Paramètres de l’éditeur (voir les paramètres principaux pour plus)',
  },
  'de-DE': {
    addUsers: 'Benutzer hinzufügen',
    collaborators: 'Mitarbeiter',
    options: 'Optionen',
    run: 'Ausführen',
    noFileSelected: 'Keine Datei ausgewählt.',
    noCode: 'Kein Code zum Anzeigen.',
    settings: 'Einstellungen',
    language: 'Sprache',
    aiAssistant: 'KI-Assistent',
    replyTo: 'Antwort an',
    send: 'Senden',
    searchMessages: 'Nachrichten suchen...',
    selectUser: 'Benutzer auswählen',
    addCollaborators: 'Mitarbeiter hinzufügen',
    previewOptions: 'Vorschauoptionen',
    editorSettings: 'Editor-Einstellungen (siehe Haupteinstellungen für mehr)',
  },
  'ja-JP': {
    addUsers: 'ユーザーを追加',
    collaborators: '共同作業者',
    options: 'オプション',
    run: '実行',
    noFileSelected: 'ファイルが選択されていません。',
    noCode: '表示するコードがありません。',
    settings: '設定',
    language: '言語',
    aiAssistant: 'AIアシスタント',
    replyTo: '返信先',
    send: '送信',
    searchMessages: 'メッセージを検索...',
    selectUser: 'ユーザーを選択',
    addCollaborators: '共同作業者を追加',
    previewOptions: 'プレビューオプション',
    editorSettings: 'エディター設定（詳細はメイン設定を参照）',
  },
};

function useProjectTranslation(language) {
  return React.useMemo(() => {
    const lang = PROJECT_TRANSLATIONS[language] ? language : 'en-US';
    return (key) => PROJECT_TRANSLATIONS[lang][key] || key;
  }, [language]);
}
import React, { useRef, useState, useEffect, useContext } from 'react'
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
import VimCodeEditor from '../components/VimCodeEditor';
import ReactModal from 'react-modal';

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
        showAvatars: true,
        vimMode: false,
      },
      behavior: {
        autoScroll: true,
        enterToSend: true,
        showSystemMessages: true, // new
        collapseReplies: false,   // new
        showReadReceipts: true,  // new
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
    };
    if (savedSettings) {
      // Deep merge saved settings with defaults
      const parsed = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
        ...parsed,
        display: { ...defaultSettings.display, ...parsed.display },
        behavior: { ...defaultSettings.behavior, ...parsed.behavior },
        accessibility: { ...defaultSettings.accessibility, ...parsed.accessibility },
        privacy: { ...defaultSettings.privacy, ...parsed.privacy },
        sidebar: { ...defaultSettings.sidebar, ...parsed.sidebar },
      };
    }
    return defaultSettings;
  });
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
  const lastNotifiedMsgId = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({}); // Track expanded replies

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

  const handleAISend = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      // Send user's googleApiKey for Gemini API access
      const res = await axios.post("/ai", { prompt: aiInput, userApiKey: user.googleApiKey });
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

  // Patch messages to simulate readBy for current user's messages
  const patchedMessages = messages.map(msg => {
    if (msg.sender && msg.sender._id === user._id) {
      return { ...msg, readBy: [user._id, 'other-user'] };
    }
    return msg;
  });

  const filteredMessages = searchTerm
    ? patchedMessages.filter((msg) => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
    : patchedMessages;

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

    // Robust system message filtering: check type or known system patterns
    const isSystemMsg = (msg.type === 'system') || (typeof msg.message === 'string' && (
      /^user (joined|left|removed|added|invited|renamed|deleted|updated)/i.test(msg.message) ||
      /^file (created|updated|deleted|renamed)/i.test(msg.message) ||
      /^system:/i.test(msg.message)
    ));
    if (isSystemMsg) {
      if (!settings.behavior.showSystemMessages) return null;
      // Try to extract user id or name from the message or sender
      let notificationText = msg.message;
      // If message is like 'User joined the project', replace 'User' with full name if possible
      if (/^User joined the project/i.test(msg.message) && msg.sender && msg.sender._id && msg.sender._id !== 'system') {
        // Try to find user in users list
        const joinedUser = users.find(u => u._id === msg.sender._id);
        if (joinedUser) {
          notificationText = `${joinedUser.firstName}${joinedUser.lastName ? ' ' + joinedUser.lastName : ''} joined the project`;
        }
      }
      // Render as notification bar
      return (
        <div key={msg._id} className="flex justify-center my-2">
          <div className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-100 rounded shadow dark:bg-blue-900 dark:text-blue-100">
            {notificationText}
          </div>
        </div>
      );
    }

    // Collapse replies if toggle is on
    const isReply = !!msg.parentMessageId;
    const isReplyCollapsed = settings.behavior.collapseReplies && isReply && !expandedReplies[msg._id];

    return (
      <motion.div
        key={msg._id}
        initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}
      >
        {isReply && !isReplyCollapsed && (
          <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
            Replying to: {parentMsg ? (typeof parentMsg.sender === "object" ? parentMsg.sender.firstName : parentMsg.sender) : "Unknown"}
          </div>
        )}
        {isReply && isReplyCollapsed && (
          <button
            className="px-2 py-1 mb-1 text-xs italic bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => setExpandedReplies(prev => ({ ...prev, [msg._id]: true }))}
          >
            Show Reply
          </button>
        )}
        <div className="flex items-start gap-2">
          {/* Only show Avatar before bubble for others */}
          {!isCurrentUser && settings.display?.showAvatars && msg.sender && (
            <Avatar firstName={msg.sender.firstName} className="w-8 h-8" />
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
            {settings.display?.showTimestamps && (
              <small className="text-[10px] text-gray-600">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </small>
            )}
            {/* Show read receipts if enabled and message is from current user and at least one other user has read it */}
            {settings.behavior.showReadReceipts && isCurrentUser && (
              (() => {
                const status = getMessageStatus(msg);
                if (!status) return null;
                return (
                  <span className="flex items-center gap-1 ml-2 text-xs" style={{ color: status.icon === 'double-green' ? '#22c55e' : status.icon === 'double' ? '#555' : '#555' }}>
                    {status.icon === 'single' && (
                      <i className="ri-check-line" title="Sent"></i>
                    )}
                    {status.icon === 'double' && (
                      <>
                        <i className="ri-check-double-line" title="Received"></i>
                      </>
                    )}
                    {status.icon === 'double-green' && (
                      <i className="ri-check-double-line" style={{ color: '#22c55e' }} title="Seen"></i>
                    )}
                    <span>{status.label}</span>
                  </span>
                );
              })()
            )}
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
    setSettings(prev => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = {};
      updated[category][key] = value;
      // Persist to localStorage
      localStorage.setItem('projectSettings', JSON.stringify(updated));

      // If updating sidebar, sync with backend
      if (category === 'sidebar' && project?._id) {
        axios.put(`/projects/sidebar-settings/${project._id}`,
          { sidebar: { ...updated.sidebar } })
          .then(res => {
            if (res.data && res.data.sidebar) {
              setSettings(prev2 => ({ ...prev2, sidebar: res.data.sidebar }));
            }
          })
          .catch(err => {
            console.error('Failed to update sidebar settings:', err);
          });
      }
      return updated;
    });
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

  // In CodeMirror style prop, remove fontFamily:
  // style={{
  //   ... remove fontFamily ...
  //   fontSize: settings.display.messageFontSize === 'large' ? '1.2rem' : settings.display.messageFontSize === 'small' ? '0.9rem' : '1rem',
  //   background: settings.display.syntaxHighlighting === false && isDarkMode
  //     ? '#181e29'
  //     : isDarkMode
  //     ? '#111827'
  //     : 'white',
  //   color: settings.display.syntaxHighlighting === false && isDarkMode ? '#fff' : undefined,
  //   height: '100%',
  //   minHeight: 0,
  // }}
  // }))
  // ...existing code...

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
              <span className="text-gray-800 dark:text-white">{t('addUsers')}</span>
            </button>
            {settings.display?.aiAssistant && (
              <button className="p-2 text-gray-800 dark:text-white" title={t('aiAssistant')} onClick={() => setIsAIModalOpen(true)}>
                <i className="ri-robot-2-line"></i>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-800 transition-colors rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              title={t('settings')}
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
                  placeholder={t('searchMessages')}
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
              style={{marginTop: '10px', marginBottom: '10px'}}
            >
              <i className="text-lg ri-settings-3-line"></i>
              {t('options')}
            </button>
            {/* Show File Tree Option */}
            {settings.sidebar?.showFileTree !== false && (
              <div className="file-tree">
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
            )}
            {/* Show Collaborators Option */}
            {settings.sidebar?.showCollaborators && project.users && (
              <div className="collaborators-list mt-4">
                <div className="font-semibold text-gray-800 dark:text-white mb-2">Collaborators</div>
                {project.users.map((u) => (
                  <div key={u._id} className="flex items-center gap-2 p-2 cursor-pointer user hover:bg-slate-200 dark:hover:bg-gray-700">
                    <Avatar firstName={u.firstName} className="w-8 h-8 text-base" />
                    <span className="text-base font-medium dark:text-white">{u.firstName}</span>
                  </div>
                ))}
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
                {t('run')}
              </button>
            </div>
          </div>
          <div className="flex flex-grow max-w-full bottom shrink" style={{overflow:'hidden', minHeight: 0}}>
            <div className="flex-grow h-full code-editor-area bg-slate-50 dark:bg-gray-900 min-h-[200px] border border-blue-200 relative flex flex-col" style={{minWidth:'0',maxWidth:'100vw',overflow:'hidden',display:'flex',flexDirection:'column', minHeight:0, flex:1}}>
              {/* Debug info for production troubleshooting (remove after fix) */}
              {typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && (
                <div style={{position:'absolute',top:0,right:0,zIndex:10,background:'#fff8',color:'#333',fontSize:'10px',padding:'2px 4px',borderRadius:'0 0 0 4px'}}>
                  <div>currentFile: {String(currentFile)}</div>
                  <div>fileTree keys: {Object.keys(fileTree).join(', ')}</div>
                  <div>fileTree[currentFile]?.file?.contents length: {fileTree[currentFile]?.file?.contents?.length ?? 'N/A'}</div>
                </div>
              )}
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
                <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 italic select-none" style={{padding:'2rem'}}>
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
              <h2 className="text-xl font-semibold text-gray-900">{t('selectUser')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-900">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="flex flex-col gap-2 mb-16 overflow-auto users-list max-h-96">
              {users.map((u) => (
                <div
                  key={u._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).includes(u._id) ? "bg-slate-200" : ""} p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(u._id)}
                >
                  <Avatar firstName={u.firstName} className="w-12 h-12 text-base" />
                  <h1 className="text-lg font-semibold text-gray-900">{u.firstName}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-blue-600 rounded-md hover:bg-blue-700 bottom-4 left-1/2"
            >
              {t('addCollaborators')}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (centered dialog) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <div 
              className="fixed inset-0 z-50 bg-black bg-opacity-50"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              ref={settingsModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 w-full max-w-md bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 rounded-xl dark:border-gray-700"
              style={modalPosition ? {
                left: modalPosition.x,
                top: modalPosition.y,
                transform: 'none',
                maxHeight: 'calc(100vh - 80px)',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'default',
              } : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: 'calc(100vh - 80px)',
                overflow: 'hidden',
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={e => {
                if (isDragging) {
                  setModalPosition(prev => ({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                  }));
                }
              }}
            >
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b cursor-move select-none dark:bg-gray-800 dark:border-gray-700"
                style={{ userSelect: 'none' }}
                onMouseDown={e => {
                  // Only start drag on left click
                  if (e.button !== 0) return;
                  const rect = settingsModalRef.current.getBoundingClientRect();
                  setIsDragging(true);
                  setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  // If modal is centered, set its position to current center
                  if (!modalPosition) {
                    setModalPosition({
                      x: rect.left,
                      y: rect.top
                    });
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <i className="text-2xl ri-close-line"></i>
                </button>
              </div>
              <div className="flex px-6 bg-gray-100 border-b dark:border-gray-700 dark:bg-gray-700">
                {['display', 'behavior', 'accessibility', 'sidebar'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSettingsTab(tab)}
                    className={`px-4 py-2 text-base font-semibold border-b-4 transition-colors duration-150 focus:outline-none ${
                      activeSettingsTab === tab 
                        ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400' 
                        : 'border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-transparent'
                    }`}
                    style={{ marginBottom: '-1px', borderRadius: '10px 10px 0 0' }}
                  >
                    {tab === 'accessibility' ? t('language') : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {/* Make this area scrollable! */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                <div className="p-6 space-y-7">
                  {/* Display Settings */}
                  {activeSettingsTab === 'display' && (
                    <div className="space-y-4">
                      {/* Vim Mode (Editor) - moved to top for visibility */}
                      <div className="flex items-center justify-between" title="Enable or disable Vim keybindings in the code editor.">
                        <span className="font-semibold text-gray-900 dark:text-white">Vim Mode (Editor)</span>
                        <button
                          onClick={() => setVimMode(v => !v)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vimMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vimMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Dark Mode */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                        <button
                          onClick={() => updateSettings('display', 'darkMode', !settings.display.darkMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Theme Color */}
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Theme Color</span>
                        <input
                          type="color"
                          value={settings.display.themeColor || '#3B82F6'}
                          onChange={e => updateSettings('display', 'themeColor', e.target.value)}
                          className="w-12 h-8 p-0 bg-transparent border-0"
                        />
                      </div>
                      {/* Chat Bubble Roundness */}
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Chat Bubble Roundness</span>
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
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Message Font Size</span>
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
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Enable Syntax Highlighting</span>
                        <button
                          onClick={() => updateSettings('display', 'syntaxHighlighting', !settings.display.syntaxHighlighting)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.syntaxHighlighting ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.syntaxHighlighting ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Show Avatars */}
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Show Avatars</span>
                        <button
                          onClick={() => updateSettings('display', 'showAvatars', !settings.display.showAvatars)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showAvatars ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showAvatars ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Show Timestamps */}
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Show Timestamps</span>
                        <button
                          onClick={() => updateSettings('display', 'showTimestamps', !settings.display.showTimestamps)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showTimestamps ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showTimestamps ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Enable AI Assistant */}
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Enable AI Assistant</span>
                        <button
                          onClick={() => updateSettings('display', 'aiAssistant', !settings.display.aiAssistant)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.aiAssistant ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.aiAssistant ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Behavior Tab */}
                  {activeSettingsTab === 'behavior' && (
                    <div className="space-y-4">
                      {/* Auto Scroll toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Auto Scroll</span>
                        <button
                          onClick={() => setSettings(prev => {
                            const updated = { ...prev, behavior: { ...prev.behavior, autoScroll: !prev.behavior.autoScroll } };
                            localStorage.setItem('projectSettings', JSON.stringify(updated));
                            return updated;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.autoScroll ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.autoScroll ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Show System Messages toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Show System Messages</span>
                        <button
                          onClick={() => setSettings(prev => {
                            const updated = { ...prev, behavior: { ...prev.behavior, showSystemMessages: !prev.behavior.showSystemMessages } };
                            localStorage.setItem('projectSettings', JSON.stringify(updated));
                            return updated;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.showSystemMessages ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.showSystemMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Collapse Replies by Default toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Collapse Replies by Default</span>
                        <button
                          onClick={() => setSettings(prev => {
                            const updated = { ...prev, behavior: { ...prev.behavior, collapseReplies: !prev.behavior.collapseReplies } };
                            localStorage.setItem('projectSettings', JSON.stringify(updated));
                            return updated;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.collapseReplies ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.collapseReplies ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Show Message Read Receipts toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Show Message Read Receipts</span>
                        <button
                          onClick={() => setSettings(prev => {
                            const updated = { ...prev, behavior: { ...prev.behavior, showReadReceipts: !prev.behavior.showReadReceipts } };
                            localStorage.setItem('projectSettings', JSON.stringify(updated));
                            return updated;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.showReadReceipts ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.showReadReceipts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {/* Enter to Send toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Enter to Send</span>
                        <button
                          onClick={() => setSettings(prev => {
                            const updated = { ...prev, behavior: { ...prev.behavior, enterToSend: !prev.behavior.enterToSend } };
                            localStorage.setItem('projectSettings', JSON.stringify(updated));
                            return updated;
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.enterToSend ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.enterToSend ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Accessibility Tab */}
                  {activeSettingsTab === 'accessibility' && (
                    <div className="space-y-4">
                      <div>
                        <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Language</span>
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
                  {/* Sidebar Tab */}
                  {activeSettingsTab === 'sidebar' && (
                    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner border dark:border-gray-700">
                      {/* Show File Tree */}
                      <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Show File Tree</span>
                        <button
                          onClick={() => updateSettings('sidebar', 'showFileTree', !settings.sidebar?.showFileTree)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.showFileTree ? 'bg-blue-600' : 'bg-gray-300'}`}
                          aria-pressed={settings.sidebar?.showFileTree}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.showFileTree ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                      {/* Show Collaborators List */}
                      <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Show Collaborators List</span>
                        <button
                          onClick={() => updateSettings('sidebar', 'showCollaborators', !settings.sidebar?.showCollaborators)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.showCollaborators ? 'bg-blue-600' : 'bg-gray-300'}`}
                          aria-pressed={settings.sidebar?.showCollaborators}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.showCollaborators ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                      {/* Pin Sidebar */}
                      <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Pin Sidebar</span>
                        <button
                          onClick={() => updateSettings('sidebar', 'pinSidebar', !settings.sidebar?.pinSidebar)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.pinSidebar ? 'bg-blue-600' : 'bg-gray-300'}`}
                          aria-pressed={settings.sidebar?.pinSidebar}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.pinSidebar ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                      {/* Sidebar Width */}
                      <div className="py-2">
                        <span className="block mb-2 font-medium text-gray-900 dark:text-white">Sidebar Width</span>
                        <input
                          type="range"
                          min={180}
                          max={400}
                          value={settings.sidebar?.sidebarWidth || 240}
                          onChange={e => updateSettings('sidebar', 'sidebarWidth', Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">{settings.sidebar?.sidebarWidth || 240}px</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Options Modal (centered dialog, compact, VimCodeEditor style) */}
      <ReactModal
        isOpen={showOptionsModal}
        onRequestClose={() => setShowOptionsModal(false)}
        closeTimeoutMS={250}
        style={{
          overlay: {
            zIndex: 10002,
            background: 'rgba(0,0,0,0.45)',
            transition: 'opacity 0.25s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          },
          content: {
            position: 'relative',
            top: '40%', // Move a bit above center
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -40%)', // Adjust transform to match new top
            maxWidth: 420,
            minWidth: 280,
            minHeight: 220,
            margin: '0 auto',
            borderRadius: 12,
            padding: 0,
            background: isDarkMode ? '#20232a' : '#f8fafd',
            color: isDarkMode ? '#fff' : '#222',
            border: 'none',
            boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
            transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), opacity 0.25s',
            opacity: showOptionsModal ? 1 : 0,
            overflow: 'hidden',
            outline: 'none',
            fontSize: 13,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
        ariaHideApp={false}
      >
        <div style={{ width: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Compact header */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: isDarkMode ? '1px solid #2c2f36' : '1px solid #e0e0e0', background: isDarkMode ? '#181a1b' : '#f3f6fa', padding: '0 16px', height: 38, fontSize: 14, fontWeight: 600 }}>
            <span>{t('options')}</span>
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: isDarkMode ? '#fff' : '#222', fontSize: 22, cursor: 'pointer', fontWeight: 700, transition: 'color 0.18s', lineHeight: 1 }} onClick={() => setShowOptionsModal(false)}>&times;</button>
          </div>
          {/* Compact options content */}
          <div style={{ flex: 1, padding: '18px 18px', minHeight: 120, background: isDarkMode ? '#20232a' : '#f8fafd', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', fontSize: 13 }}>
            {/* Example options, replace/add as needed for your app */}
            <div style={{ minWidth: 120, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ri-settings-3-line" style={{ fontSize: 18, marginRight: 6 }}></i>
              <span>{t('editorSettings')}</span>
            </div>
            <div style={{ minWidth: 120, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ri-eye-line" style={{ fontSize: 18, marginRight: 6 }}></i>
              <span>{t('previewOptions')}</span>
            </div>
            {/* Add more compact options as needed */}
          </div>
        </div>
      </ReactModal>

      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <button
              className="absolute text-gray-500 top-2 right-2 hover:text-gray-900 dark:hover:text-white"
              onClick={() => {
                setIsAIModalOpen(false);
                setAiInput("");
                setAiResponse("");
              }}
            >
              <i className="text-2xl ri-close-line"></i>
            </button>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
            <input
              type="text"
              className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Ask ChatRaj..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (aiInput.trim()) handleAISend();
                }
              }}
              autoFocus
            />
            <button
              className="w-full py-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleAISend}
              disabled={aiLoading || !aiInput.trim()}
            >
              {aiLoading ? 'Thinking...' : 'Send'}
            </button>
            {aiResponse && (
              <div className="p-2 mt-2 text-gray-800 whitespace-pre-wrap bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Project