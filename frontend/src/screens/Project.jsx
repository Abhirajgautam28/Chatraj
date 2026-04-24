import React, { useRef, useState, useEffect, useContext, useMemo, useCallback, useDeferredValue } from 'react'
import { UserContext } from '../context/user.context'
import { ThemeContext } from '../context/theme.context'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage, sendStatusUpdate } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import Avatar from '../components/Avatar';
import FileIcon from '../components/FileIcon';
import 'highlight.js/styles/github.css';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const SyntaxHighlightedCode = React.memo(({ children, className }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
    }
  }, [className, children])
  return <code ref={ref} className={className} style={{ whiteSpace: 'pre-wrap', display: 'block' }}>{children}</code>
});

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [project, setProject] = useState(location.state?.project)
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearch = useDeferredValue(searchTerm);
  const messageBox = useRef(null)
  const [input, setInput] = useState('')
  const workerRef = useRef(null);

  useEffect(() => {
    if (!project) { navigate('/dashboard'); return; }

    workerRef.current = new Worker(new URL('../../public/worker.js', import.meta.url));
    workerRef.current.onmessage = (e) => {
        if (e.data.action === 'normalize_file_tree_result') setFileTree(e.data.result);
    };

    initializeSocket(project._id);

    axios.get(`/api/projects/get-project/${project._id}`).then(res => {
        setProject(res.data.project);
        if (res.data.project.fileTree) workerRef.current.postMessage({ action: 'normalize_file_tree', data: res.data.project.fileTree });
    });

    axios.get(`/api/projects/messages/${project._id}`).then(res => setMessages(res.data.messages || []));

    receiveMessage("project-message", (data) => {
        setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data]);
        if (data._id) sendStatusUpdate('read', data._id);
    });

    receiveMessage("ai-stream-start", (data) => {
        setMessages(prev => [...prev, { ...data, sender: { _id: 'Chatraj', firstName: 'Chat', lastName: 'Raj' }, message: '', streaming: true }]);
    });

    receiveMessage("ai-stream-chunk", ({ _id, chunk }) => {
        setMessages(prev => prev.map(m => m._id === _id ? { ...m, message: m.message + chunk } : m));
    });

    receiveMessage("ai-stream-end", (finalMsg) => {
        setMessages(prev => prev.map(m => m._id === finalMsg._id ? { ...finalMsg, streaming: false } : m));
    });

    return () => workerRef.current?.terminate();
  }, [project?._id]);

  useEffect(() => {
    if (messageBox.current) messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }, [messages]);

  const filteredMessages = useMemo(() => {
      if (!deferredSearch) return messages;
      const lower = deferredSearch.toLowerCase();
      return messages.filter(m => m.message.toLowerCase().includes(lower));
  }, [deferredSearch, messages]);

  const send = useCallback(() => {
    if (!input.trim()) return;
    sendMessage("project-message", { message: input, sender: user, googleApiKey: user.googleApiKey });
    setInput("");
  }, [input, user]);

  return (
    <main className="flex w-screen h-screen overflow-hidden bg-gray-950 font-sans antialiased text-gray-200">
        <section className="relative flex flex-col h-screen min-w-[400px] bg-gray-900 border-r border-white/5">
            <header className="p-4 flex justify-between items-center border-b border-white/5 bg-gray-900/50 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold tracking-tight text-white">{project?.name}</span>
                </div>
                <input placeholder="Search..." className="bg-gray-800 rounded-md px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all w-24 focus:w-40" onChange={e => setSearchTerm(e.target.value)} />
            </header>

            <div ref={messageBox} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredMessages.map(msg => (
                    <div key={msg._id} className={`flex gap-3 ${msg.sender?._id === user._id ? 'flex-row-reverse' : ''}`}>
                        <Avatar firstName={msg.sender?.firstName || 'A'} className="w-8 h-8 shadow-md" />
                        <div className={`max-w-[85%] ${msg.sender?._id === user._id ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`px-4 py-2 rounded-2xl text-sm transition-all ${msg.sender?._id === user._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'} ${msg.streaming ? 'opacity-70 border border-blue-500/30' : ''}`}>
                                <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>{msg.message}</Markdown>
                                {msg.streaming && <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse align-middle"></span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-900/80 border-t border-white/5">
                <div className="flex gap-2 bg-gray-800/50 p-2 rounded-xl border border-white/5 focus-within:border-blue-500/30 transition-all">
                    <input className="flex-grow bg-transparent border-none text-sm text-white outline-none px-2" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message or @Chatraj..." />
                    <button onClick={send} className="w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <i className="ri-send-plane-2-fill"></i>
                    </button>
                </div>
            </div>
        </section>

        <section className="flex-grow flex flex-col bg-[#0b0e14]">
            <nav className="flex bg-gray-900 border-b border-white/5 p-2 gap-1 overflow-x-auto no-scrollbar">
                {openFiles.map(file => (
                    <button key={file} onClick={() => setCurrentFile(file)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${currentFile === file ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:bg-gray-800'}`}>
                        <FileIcon fileName={file} /> {file}
                    </button>
                ))}
            </nav>
            <div className="flex-grow">
                {currentFile ? (
                    <CodeMirror value={fileTree[currentFile]?.file?.contents || ""} theme="dark" extensions={[javascript()]} className="h-full text-sm" height="100%" />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-800 font-mono tracking-tighter opacity-10 text-6xl">ENGINE</div>
                )}
            </div>
        </section>
    </main>
  )
}

export default React.memo(Project)
