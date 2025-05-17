import socket from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://your-render-backend-url.onrender.com';

let socketInstance = null;
const callbacks = {};

export const initializeSocket = (projectId) => {
    socketInstance = socket(SOCKET_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    socketInstance.on('typing', (data) => {
        callbacks['typing']?.forEach(cb => cb(data));
    });

    socketInstance.on('stop-typing', (data) => {
        callbacks['stop-typing']?.forEach(cb => cb(data));
    });

    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}

// Add these event emitters
export const emitTyping = (data) => {
    if (socketInstance) socketInstance.emit('typing', data);
};

export const emitStopTyping = (data) => {
    if (socketInstance) socketInstance.emit('stop-typing', data);
};