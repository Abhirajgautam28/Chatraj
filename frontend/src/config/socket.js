import socket from 'socket.io-client';

// Prefer explicit VITE_API_URL when provided. Otherwise prefer the local
// backend when running on localhost/127.0.0.1 so E2E tests connect to the
// developer backend. As a last-resort fallback, honor the production URL.
const defaultLocal = `${location.protocol}//${location.hostname}:8080`;
const isLocal = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
// Prefer local backend when running on localhost to avoid accidentally
// connecting to a production backend during local E2E/debug runs.
let SOCKET_URL = isLocal ? defaultLocal : (import.meta.env.VITE_API_URL || ((import.meta.env && import.meta.env.PROD) ? 'https://your-render-backend-url.onrender.com' : defaultLocal));

// Debug: log the resolved socket URL to help diagnose environment issues
if (import.meta.env.DEV) {
    try { console.log('DEBUG: socket URL ->', SOCKET_URL); } catch (e) {}
}

let socketInstance = null;
const pendingListeners = new Map();

const attachPendingListeners = () => {
    if (!socketInstance) return;

    pendingListeners.forEach((callbacks, eventName) => {
        callbacks.forEach((callback) => {
            socketInstance.on(eventName, callback);
        });
    });

    pendingListeners.clear();
};

export const initializeSocket = (projectId) => {
    if (socketInstance) {
        socketInstance.disconnect();
    }

    // Prefer token from localStorage, but fall back to cookie token (tests often set cookie)
    const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let token = lsToken;
    if (!token) {
        try {
            const m = (typeof document !== 'undefined' && document.cookie) ? document.cookie.match('(^|;)\\s*token\\s*=\\s*([^;]+)') : null;
            if (m && m[2]) token = decodeURIComponent(m[2]);
        } catch (e) {}
    }

    socketInstance = socket(SOCKET_URL, {
        auth: {
            token
        },
        query: {
            projectId
        }
    });

    attachPendingListeners();

    // Add debug listeners to surface connection state during E2E runs
    if (import.meta.env.DEV) {
            try {
                socketInstance.on('connect', () => {
                    try { console.log('SOCKET CONNECTED', socketInstance.id); } catch (e) {}
                });
                socketInstance.on('connect_error', (err) => {
                    try { console.log('SOCKET CONNECT_ERROR', err && (err.message || err)); } catch (e) {}
                });
                socketInstance.on('disconnect', (reason) => {
                    try { console.log('SOCKET DISCONNECT', reason); } catch (e) {}
                });
            } catch (e) {}
            // Expose socket instance in dev for debugging and E2E introspection only
            try {
                // Expose for tests and local debugging. Avoid in prod.
                // eslint-disable-next-line no-undef
                window.__socketInstance = socketInstance;
            } catch (e) {}
        }

    return socketInstance;
}

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export const receiveMessage = (eventName, cb) => {
    if (!eventName || typeof cb !== 'function') return;

    if (socketInstance) {
        socketInstance.on(eventName, cb);
        return;
    }

    if (!pendingListeners.has(eventName)) {
        pendingListeners.set(eventName, []);
    }
    pendingListeners.get(eventName).push(cb);
}

export const removeListener = (eventName, cb) => {
    if (!eventName || typeof cb !== 'function') return;

    if (socketInstance) {
        socketInstance.off(eventName, cb);
        return;
    }

    if (pendingListeners.has(eventName)) {
        pendingListeners.set(eventName, pendingListeners.get(eventName).filter((listener) => listener !== cb));
        if (pendingListeners.get(eventName).length === 0) {
            pendingListeners.delete(eventName);
        }
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