import socket from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://your-render-backend-url.onrender.com';

let socketInstance = null;
const statusBuffer = { delivered: new Set(), read: new Set() };
let flushTimer = null;

export const initializeSocket = (projectId) => {
    socketInstance = socket(SOCKET_URL, {
        auth: { token: localStorage.getItem('token') },
        query: { projectId }
    });
    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
    if (socketInstance) socketInstance.on(eventName, cb);
}

// Zenith Feature: Buffered Status Updates
export const sendStatusUpdate = (type, messageId) => {
    statusBuffer[type].add(messageId);
    if (!flushTimer) {
        flushTimer = setTimeout(() => {
            if (statusBuffer.delivered.size > 0) {
                socketInstance.emit('batch-delivered', Array.from(statusBuffer.delivered));
                statusBuffer.delivered.clear();
            }
            if (statusBuffer.read.size > 0) {
                socketInstance.emit('batch-read', Array.from(statusBuffer.read));
                statusBuffer.read.clear();
            }
            flushTimer = null;
        }, 1000); // 1 second batching window
    }
}

export const sendMessage = (eventName, data) => {
    if (socketInstance) socketInstance.emit(eventName, data);
}

export const emitTyping = (data) => {
    if (socketInstance) socketInstance.volatile.emit('typing', data);
};

export const emitStopTyping = (data) => {
    if (socketInstance) socketInstance.volatile.emit('stop-typing', data);
};
