import socket from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://your-render-backend-url.onrender.com';

let socketInstance = null;
const callbacks = {};

export const initializeSocket = (projectId) => {
    if (socketInstance) {
        socketInstance.disconnect();
    }

    socketInstance = socket(SOCKET_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    return socketInstance;
}

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export const receiveMessage = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.on(eventName, cb);
    }
}

export const removeListener = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.off(eventName, cb);
    }
}

export const sendMessage = (eventName, data) => {
    if (socketInstance) {
        socketInstance.emit(eventName, data);
    }
}

// Add these event emitters
export const emitTyping = (data) => {
    if (socketInstance) socketInstance.emit('typing', data);
};

export const emitStopTyping = (data) => {
    if (socketInstance) socketInstance.emit('stop-typing', data);
};