import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { io } from 'socket.io-client';

const SystemDiagnostics = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [logs, setLogs] = useState([]);
    const [emailTarget, setEmailTarget] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedPassword = sessionStorage.getItem('dev_ui_password');
        if (savedPassword) {
            setPassword(savedPassword);
            verifyPassword(savedPassword);
        }
    }, []);

    const addLog = (message, type = 'info') => {
        setLogs(prev => {
            const newLogs = [...prev, { time: new Date().toLocaleTimeString(), message, type }];
            if (newLogs.length > 100) {
                return newLogs.slice(newLogs.length - 100);
            }
            return newLogs;
        });
    };

    const verifyPassword = async (passToVerify) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/diagnostics/ping', {
                headers: { 'X-Dev-Password': passToVerify }
            });
            if (res.data.status === 'ok') {
                setIsAuthenticated(true);
                sessionStorage.setItem('dev_ui_password', passToVerify);
                addLog('Authentication successful. Backend is reachable.', 'success');
            }
        } catch (error) {
            setIsAuthenticated(false);
            sessionStorage.removeItem('dev_ui_password');
            addLog(`Authentication failed: ${error.response?.data?.error || error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setLogs([]); // clear logs on new login attempt
        verifyPassword(password);
    };

    const runTest = async (name, endpoint, method = 'GET', body = null) => {
        setLoading(true);
        addLog(`Starting test: ${name}...`);
        try {
            const config = {
                method,
                url: `/api/diagnostics${endpoint}`,
                headers: { 'X-Dev-Password': password },
            };
            if (body) config.data = body;

            const res = await axios(config);
            addLog(`${name} SUCCESS: \n${JSON.stringify(res.data, null, 2)}`, 'success');
        } catch (error) {
            addLog(`${name} ERROR: \n${JSON.stringify(error.response?.data || error.message, null, 2)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testSocket = () => {
        setLoading(true);
        addLog('Starting test: Socket.io connection...');

        // Use the API_URL from axios config if possible, or fallback to current origin
        const backendUrl = axios.defaults.baseURL || window.location.origin;

        const socket = io(backendUrl, {
            // We can't fully authenticate without a project ID and token,
            // but we can check if the server accepts the connection request
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 2,
            timeout: 5000,
        });

        socket.on('connect', () => {
            addLog('Socket.io connected successfully (unauthenticated state).', 'success');
            socket.disconnect();
            setLoading(false);
        });

        socket.on('connect_error', (err) => {
            // It might fail authentication (which is fine, it means the server is there)
            // or it might fail to reach the server at all.
            if (err.message === 'Invalid projectId' || err.message === 'Authentication error') {
                 addLog(`Socket.io reached server, but disconnected as expected: ${err.message}`, 'success');
            } else {
                 addLog(`Socket.io connection error: ${err.message}`, 'error');
            }
            socket.disconnect();
            setLoading(false);
        });
    };


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Developer Diagnostics Login</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">DEV_UI_PASSWORD</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>
                    </form>

                    {logs.length > 0 && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                            {logs[logs.length - 1].message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-mono">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-400">Chatraj System Diagnostics Dashboard</h1>
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('dev_ui_password');
                            setIsAuthenticated(false);
                            setLogs([]);
                            setPassword('');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Controls Panel */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Run Tests</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => runTest('Backend Ping', '/ping')}
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left transition disabled:opacity-50"
                            >
                                🌐 Ping Backend
                            </button>

                            <button
                                onClick={() => runTest('Database Connection', '/db')}
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left transition disabled:opacity-50"
                            >
                                🗄️ Test Database
                            </button>

                            <button
                                onClick={() => runTest('Redis Connection', '/redis')}
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left transition disabled:opacity-50"
                            >
                                ⚡ Test Redis
                            </button>

                            <button
                                onClick={() => runTest('Google AI Connection', '/ai')}
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left transition disabled:opacity-50"
                            >
                                🤖 Test Google AI
                            </button>

                            <button
                                onClick={testSocket}
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-left transition disabled:opacity-50"
                            >
                                🔌 Test Socket.io
                            </button>
                        </div>

                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <h3 className="text-sm font-semibold mb-3">✉️ Test Email Configuration</h3>
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    placeholder="Target email address"
                                    value={emailTarget}
                                    onChange={(e) => setEmailTarget(e.target.value)}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={() => runTest('Send Email', '/email', 'POST', { email: emailTarget })}
                                    disabled={loading || !emailTarget}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Terminal/Logs Panel */}
                    <div className="bg-black rounded-lg border border-gray-700 flex flex-col h-[600px]">
                        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center rounded-t-lg">
                            <span className="text-sm text-gray-400">Diagnostic Logs</span>
                            <button
                                onClick={() => setLogs([])}
                                className="text-xs text-gray-500 hover:text-gray-300"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2">
                            {logs.length === 0 ? (
                                <div className="text-gray-600 italic">Waiting for tests to run...</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="border-b border-gray-900 pb-2 mb-2">
                                        <span className="text-gray-500 text-xs mr-2">[{log.time}]</span>
                                        <span className={`whitespace-pre-wrap ${
                                            log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-green-400' :
                                            'text-blue-300'
                                        }`}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemDiagnostics;
