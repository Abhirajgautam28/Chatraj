import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'
import { motion } from 'framer-motion'
import Avatar from '../components/Avatar';
import EmojiPicker from '../components/EmojiPicker';
import FileIcon from '../components/FileIcon';

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)
  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])
  return <code {...props} ref={ref} />
}

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageEmojiPickers, setMessageEmojiPickers] = useState({});

  const toggleEmojiPicker = (messageId) => {
    setMessageEmojiPickers(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleReaction = (messageId, emoji, userId) => {
    // Don't allow users to react to their own messages
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
    if (!message.trim()) return
    const payload = {
      message,
      sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null
    }
    sendMessage("project-message", payload)
    setMessage("")
    setReplyingTo(null)
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
  }, [webContainer])

  useEffect(() => {
    if (messageBox.current)
      messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handleIncomingMessage = (data) => {
      if (data.sender._id === "Chatraj") {
        try {
          const msgObj = JSON.parse(data.message)
          console.log(msgObj)
          webContainer?.mount(msgObj.fileTree)
          if (msgObj.fileTree) setFileTree(msgObj.fileTree)
        } catch (error) {
          console.error("Error parsing AI message:", error)
        }
      }
      setMessages((prev) => {
        const existingIndex = prev.findIndex((msg) => msg._id === data._id)
        if (existingIndex !== -1) {
          const updatedMessages = [...prev]
          updatedMessages[existingIndex] = data
          return updatedMessages
        }
        return [...prev, data]
      })
    }

    receiveMessage("project-message", handleIncomingMessage)
  }, [webContainer])

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

  const filteredMessages = searchTerm
    ? messages.filter((msg) => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages

  const groupedMessages = groupMessagesByDate(filteredMessages)

  const renderMessage = (msg, index) => {
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
        key={index}
        initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}
      >
        {msg.parentMessageId && (
          <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
            Replying to:{" "}
            {parentMsg
              ? typeof parentMsg.sender === "object"
                ? parentMsg.sender.email
                : parentMsg.sender
              : "Unknown"}
          </div>
        )}
        <div className="flex items-start gap-2">
          {!isCurrentUser && (
            <Avatar 
              email={typeof msg.sender === "object" ? msg.sender.email : msg.sender} 
              className="w-8 h-8 text-sm"
            />
          )}
          <div
            className={`flex flex-col p-2 rounded-md max-w-xs break-words ${
              isCurrentUser ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow"
            }`}
          >
            {!isCurrentUser && (
              <small className="mb-1 font-bold text-gray-700">
                {typeof msg.sender === "object" ? msg.sender.email : msg.sender}
              </small>
            )}
            <div className="text-sm whitespace-pre-wrap">
              {msg.sender && msg.sender._id === "Chatraj" ? (
                <div className="p-2 text-white rounded bg-slate-950">
                  <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>{msg.message}</Markdown>
                </div>
              ) : (
                <p>{msg.message}</p>
              )}
            </div>
          </div>
          {isCurrentUser && (
            <Avatar 
              email={user.email} 
              className="w-8 h-8 text-sm"
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
              // Don't show reactions with no users
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
                    return reactingUser ? reactingUser.email : 'Unknown';
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

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-100 dark:bg-gray-800">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <button className="flex gap-2 text-gray-800 dark:text-white" onClick={() => setIsModalOpen(true)}>
              <i className="mr-1 ri-user-add-fill"></i>
              <p>Add Users</p>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!showSearch ? (
              <button onClick={() => setShowSearch(true)} className="text-gray-800 dark:text-white">
                <i className="ri-search-eye-fill"></i>
              </button>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 p-2 text-sm transition-all duration-300 border rounded"
                />
                <button onClick={() => setShowSearch(false)} className="absolute text-gray-800 dark:text-white right-2 top-2">
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
              className="p-2 text-gray-800 dark:text-white"
            >
              <i className="ri-user-community-line"></i>
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
                {groupedMessages[groupLabel].map((msg, idx) => renderMessage(msg, idx))}
              </div>
            ))}
        </div>
        {replyingTo && (
          <div className="absolute z-20 flex items-center px-3 py-1 rounded-full shadow-md bottom-14 left-2 max-w-max bg-gradient-to-r from-blue-500 to-purple-500">
            <i className="mr-1 text-xs text-white ri-reply-line" />
            <span className="text-xs text-white">
              Replying to {replyingTo.sender?.email || 'Unknown'}
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
                return typingUser?.email;
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
            className="px-5 text-white bg-blue-600 hover:bg-blue-700">
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
                    email={u.email} 
                    className="w-12 h-12 text-base"
                  />
                  <h1 className="text-lg font-semibold dark:text-white">{u.email}</h1>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 right">
        <div className="h-full explorer max-w-64 min-w-52 bg-slate-200 dark:bg-gray-500">
          <div className="w-full file-tree">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
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
              {openFiles.map((file, index) => (
                <button
                  key={index}
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
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                }} 
                className="p-2 px-4 text-gray-600 rounded dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
              </button>
              <button
                onClick={async () => {
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
                className="p-2 px-4 text-white bg-blue-600 hover:bg-blue-700">
                run
              </button>
            </div>
          </div>
          <div className="flex flex-grow max-w-full overflow-auto bottom shrink">
            {fileTree[currentFile] && (
              <div className="flex-grow h-full overflow-auto code-editor-area bg-slate-50 dark:bg-gray-900">
                <pre className="h-full hljs dark:bg-gray-900">
                  <code
                    className="h-full outline-none hljs dark:text-white"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText
                      const ft = { ...fileTree, [currentFile]: { file: { contents: updatedContent } } }
                      setFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight("javascript", fileTree[currentFile].file.contents).value
                    }}
                    style={{ 
                      whiteSpace: "pre-wrap", 
                      paddingBottom: "25rem",
                      padding: "1rem",
                      backgroundColor: isDarkMode ? "#111827" : "white",
                      color: isDarkMode ? "#fff" : "#000"
                    }}
                  />
                </pre>
              </div>
            )}
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
                    // Set constant light mode styles
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
                } catch (error) {
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
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
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
                  <Avatar 
                    email={u.email} 
                    className="w-12 h-12 text-base"
                  />
                  <h1 className="text-lg font-semibold">{u.email}</h1>
                </div>
              ))}
            </div>
            <button onClick={addCollaborators} className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-blue-600 rounded-md bottom-4 left-1/2">
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Project