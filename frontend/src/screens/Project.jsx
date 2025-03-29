import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'

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

    let reactionDisplay = null
    if (msg.reactions && msg.reactions.length > 0) {
      const reactionEmails = msg.reactions.map((r) => {
        const foundUser = users.find((u) => String(u._id) === String(r.userId))
        if (foundUser) {
          return foundUser.email
        } else if (String(r.userId) === String(user._id)) {
          return user.email
        }
        return r.userId
      })
      reactionDisplay = (
        <span className="text-xs cursor-default" title={reactionEmails.join(", ")}>
          {msg.reactions[0].emoji} {msg.reactions.length}
        </span>
      )
    }

    return (
      <div key={index} className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}>
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
        <div className="flex items-center gap-2 mt-1">
          <small className="text-[10px] text-gray-600">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </small>
          <button
            className="text-xs"
            onClick={() => {
              if (isCurrentUser) {
                console.log("You cannot like your own message.")
                return
              }
              if (msg._id) {
                sendMessage("message-reaction", { messageId: msg._id, emoji: "❤️", userId: user._id })
              } else {
                console.log("Message ID missing; cannot add reaction")
              }
            }}
          >
            ❤️
          </button>
          {reactionDisplay}
          <button
            className="text-xs"
            onClick={() => {
              setReplyingTo(
                typeof msg.sender === "string"
                  ? { ...msg, sender: { email: msg.sender } }
                  : msg
              );
            }}
          >
            Reply
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-100 dark:bg-gray-800">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
              <i className="mr-1 ri-user-add-fill"></i>
              <p>Add Users</p>
            </button>
          </div>
          <button 
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
            className="p-2"
          >
            <i className="ri-user-community-line"></i>
          </button>
        </header>
        <div className="flex items-center justify-end p-2 mt-12">
          {!showSearch ? (
            <button onClick={() => setShowSearch(true)} className="text-gray-600">
              <i className="ri-search-eye-fill"></i>
            </button>
          ) : (
            <div className="relative transition-all duration-300">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 transition-all duration-300 border rounded"
              />
              <button onClick={() => setShowSearch(false)} className="absolute text-gray-600 right-2 top-2">
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}
        </div>
        <div ref={messageBox} className="flex flex-col flex-grow gap-1 p-1 pb-20 overflow-auto message-box scrollbar-hide bg-slate-50 dark:bg-gray-800">
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
        <div className="absolute bottom-0 flex w-full bg-white inputField dark:bg-gray-800">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
          <button onClick={send} className="px-5 text-white bg-slate-950 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700">
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
                  <div className="flex items-center justify-center p-5 text-white rounded-full bg-slate-600 dark:bg-gray-600">
                    <i className="ri-user-fill"></i>
                  </div>
                  <h1 className="text-lg font-semibold dark:text-white">{u.email}</h1>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 dark:bg-gray-900 right">
        <div className="h-full explorer max-w-64 min-w-52 bg-slate-200 dark:bg-gray-800">
          <div className="w-full file-tree">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles([...new Set([...openFiles, file])])
                }}
                className="flex items-center w-full gap-2 p-2 px-4 cursor-pointer tree-element bg-slate-300 dark:bg-gray-700 dark:text-white"
              >
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
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 px-4 text-gray-600 rounded dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
              </button>
              <button
                onClick={async () => {
                  try {
                    // First, ensure proper directory structure
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

                    // Kill existing process if running
                    if (runProcess) {
                      await runProcess.kill();
                    }

                    // Install dependencies with improved retry logic
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

                    // Start the server with better error handling
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

                    // Listen for server ready event
                    webContainer.on('server-ready', (port, url) => {
                      console.log('Server ready on:', url);
                      setIframeUrl(url);
                    });

                  } catch (error) {
                    console.error('Error running project:', error);
                    // Add visual feedback for the error
                    alert(`Failed to run project: ${error.message}`);
                  }
                }}
                className="p-2 px-4 text-white bg-slate-300 dark:bg-blue-600 hover:bg-slate-400 dark:hover:bg-blue-700"
              >
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
                  <div className="flex items-center justify-center p-5 text-white rounded-full bg-slate-600">
                    <i className="ri-user-fill"></i>
                  </div>
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