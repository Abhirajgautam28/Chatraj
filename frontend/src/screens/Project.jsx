import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
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

// Place these helper functions inside your Project component (or right outside it)

const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const getGroupLabel = (date) => {
  const today = new Date();
  if (isSameDay(date, today)) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  
  // Otherwise format the date (you can change formatting as needed)
  return date.toLocaleDateString(); // e.g. "03/03/2025"
};

const groupMessagesByDate = (messagesArr) => {
  const groups = {};
  messagesArr.forEach(msg => {
    const d = new Date(msg.createdAt);
    const label = getGroupLabel(d);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(msg);
  });
  return groups;
};

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = useRef(null)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  // To support threaded replies
  const [replyingTo, setReplyingTo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");  // new state for searching

  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
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
    axios.put("/projects/add-user", {
      projectId: location.state.project._id,
      users: Array.from(selectedUserId)
    })
      .then(res => {
        console.log(res.data)
        setIsModalOpen(false)
      })
      .catch(err => console.log(err))
  }

  const send = () => {
    if (!message.trim()) return;
    const payload = {
      message,
      sender: user,
      parentMessageId: replyingTo ? replyingTo._id : null
    };
    sendMessage('project-message', payload);
    setMessage("");
    setReplyingTo(null);
  }

  useEffect(() => {
    if (messages.length && messageBox.current) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg._id) {
        sendMessage('message-read', { messageId: lastMsg._id, userId: user._id })
      }
    }
  }, [messages, user])

  useEffect(() => {
    initializeSocket(project._id)
    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log("container started")
      })
    }
    axios.get(`/projects/get-project/${location.state.project._id}`)
      .then(res => {
        console.log(res.data.project)
        setProject(res.data.project)
        setFileTree(res.data.project.fileTree || {})
      })
    axios.get('/users/all')
      .then(res => {
        setUsers(res.data.users)
      })
      .catch(err => console.log(err))
  }, [webContainer])

  useEffect(() => {
    if (messageBox.current)
      messageBox.current.scrollTop = messageBox.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handleIncomingMessage = data => {
      if (data.sender._id === 'Chatraj') {
        try {
          const msgObj = JSON.parse(data.message);
          console.log(msgObj);
          webContainer?.mount(msgObj.fileTree);
          if (msgObj.fileTree) setFileTree(msgObj.fileTree);
        } catch (error) {
          console.error("Error parsing AI message:", error);
        }
      }
      setMessages(prev => {
        const existingIndex = prev.findIndex(msg => msg._id === data._id);
        if (existingIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = data;
          return updatedMessages;
        }
        return [...prev, data];
      });
    };

    receiveMessage('project-message', handleIncomingMessage);
  }, [webContainer]);

  // Compute filtered messages (if searchTerm exists, filter by message text)
  const filteredMessages = searchTerm 
    ? messages.filter(msg => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  const groupedMessages = groupMessagesByDate(filteredMessages);

  const renderMessage = (msg, index) => {
    const isCurrentUser =
      msg.sender && typeof msg.sender === 'object' &&
      msg.sender._id && (msg.sender._id.toString() === user._id.toString());

    const parentMsg = msg.parentMessageId && messages.find(m => m._id === msg.parentMessageId);

    let reactionDisplay = null;
    if (msg.reactions && msg.reactions.length > 0) {
      const reactionEmails = msg.reactions.map(r => {
        const foundUser = users.find(u => String(u._id) === String(r.userId));
        if (foundUser) {
          return foundUser.email;
        } else if (String(r.userId) === String(user._id)) {
          return user.email;
        }
        return r.userId;
      });
      reactionDisplay = (
        <span 
          className="text-xs cursor-default"
          title={reactionEmails.join(", ")}
        >
          {msg.reactions[0].emoji} {msg.reactions.length}
        </span>
      );
    }

    return (
      <div key={index} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-2`}>
        {msg.parentMessageId && (
          <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
            Replying to: {parentMsg
              ? ((parentMsg.sender && typeof parentMsg.sender === 'object')
                ? parentMsg.sender.email
                : parentMsg.sender)
              : 'Unknown'}
          </div>
        )}
        <div className={`flex flex-col p-2 rounded-md max-w-xs break-words ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow'}`}>
          {!isCurrentUser && (
            <small className="mb-1 font-bold text-gray-700">
              {(msg.sender && typeof msg.sender === 'object') ? msg.sender.email : msg.sender}
            </small>
          )}
          <div className="text-sm whitespace-pre-wrap">
            {msg.sender && msg.sender._id === 'Chatraj'
              ? (
                <div className="p-2 text-white rounded bg-slate-950">
                  <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
                    {msg.message}
                  </Markdown>
                </div>
              )
              : <p>{msg.message}</p>
            }
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <small className="text-[10px] text-gray-600">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </small>
          {/* Reaction button */}
          <button
            className="text-xs"
            onClick={() => {
              if (isCurrentUser) {
                console.log("You cannot like your own message.");
                return;
              }
              if (msg._id) {
                sendMessage('message-reaction', { messageId: msg._id, emoji: '❤️', userId: user._id });
              } else {
                console.log("Message ID missing; cannot add reaction");
              }
            }}
          >
            ❤️
          </button>
          {reactionDisplay}
          {/* Reply button */}
          <button
            className="text-xs"
            onClick={() => {
              setReplyingTo(msg);
            }}
          >
            Reply
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="flex w-screen h-screen">
      <section className="relative flex flex-col h-screen left min-w-96 bg-slate-300">
        <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="mr-1 ri-user-add-fill"></i>
            <p>Add Users</p>
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
            <i className="ri-user-community-line"></i>
          </button>
        </header>

        {/* Add search input above your messages */}
        <div className="p-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="relative flex flex-col flex-grow h-full pb-10 conversation-area pt-14">
          <div ref={messageBox} className="flex flex-col flex-grow max-h-full gap-1 p-1 overflow-auto message-box scrollbar-hide">
            {Object.keys(groupedMessages)
              .sort((a, b) => {
                // Optional: sort the date groups; you could convert group labels back to timestamps
                return a.localeCompare(b);
              })
              .map((groupLabel) => (
                <div key={groupLabel}>
                  <div className="py-2 text-sm text-center text-gray-500">
                    {groupLabel}
                  </div>
                  {groupedMessages[groupLabel].map((msg, idx) => renderMessage(msg, idx))}
                </div>
            ))}
          </div>
          {/* Reply banner */}
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-300">
              <span className="text-sm italic">
                Replying to: {(replyingTo.sender && replyingTo.sender.email) || replyingTo.sender}
              </span>
              <button className="text-xs text-red-500" onClick={() => setReplyingTo(null)}>Cancel</button>
            </div>
          )}
          <div className="absolute bottom-0 flex w-full inputField">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
              className="flex-grow p-2 px-4 border-none outline-none"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 text-white bg-slate-950">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
          <header className="flex items-center justify-between p-2 px-4 bg-slate-200">
            <h1 className="text-lg font-semibold">Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="flex flex-col gap-2 users">
            {project.users && project.users.map(u => (
              <div key={u._id} className="flex items-center gap-2 p-2 cursor-pointer user hover:bg-slate-200">
                <div className="flex items-center justify-center p-5 text-white rounded-full bg-slate-600">
                  <i className="ri-user-fill"></i>
                </div>
                <h1 className="text-lg font-semibold">{u.email}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-grow h-full bg-blue-50 right">
        <div className="h-full explorer max-w-64 min-w-52 bg-slate-200">
          <div className="w-full file-tree">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles([...new Set([...openFiles, file])])
                }}
                className="flex items-center w-full gap-2 p-2 px-4 cursor-pointer tree-element bg-slate-300"
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
                  className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}
                >
                  <p className="text-lg font-semibold">{file}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2 actions">
              <button
                onClick={async () => {
                  await webContainer.mount(fileTree)
                  const installProcess = await webContainer.spawn("npm", ["install"])
                  installProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk) } }))
                  if (runProcess) runProcess.kill()
                  let tempRunProcess = await webContainer.spawn("npm", ["start"])
                  tempRunProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk) } }))
                  setRunProcess(tempRunProcess)
                  webContainer.on('server-ready', (port, url) => { console.log(port, url); setIframeUrl(url) })
                }}
                className="p-2 px-4 text-white bg-slate-300"
              >
                run
              </button>
            </div>
          </div>
          <div className="flex flex-grow max-w-full overflow-auto bottom shrink">
            {fileTree[currentFile] && (
              <div className="flex-grow h-full overflow-auto code-editor-area bg-slate-50">
                <pre className="h-full hljs">
                  <code
                    className="h-full outline-none hljs"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = { ...fileTree, [currentFile]: { file: { contents: updatedContent } } }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value
                    }}
                    style={{ whiteSpace: 'pre-wrap', paddingBottom: '25rem' }}
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
                className="w-full p-2 px-4 bg-slate-200"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full"></iframe>
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
              {users.map(u => (
                <div key={u._id} className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).includes(u._id) ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(u._id)}>
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