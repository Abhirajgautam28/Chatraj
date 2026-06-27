import { useEffect, useRef, useCallback } from 'react';
import { initializeSocket, disconnectSocket, receiveMessage, removeListener, sendMessage } from '../config/socket';
import { logger } from '../utils/logger';

export const useSocket = (projectId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const tryInit = async () => {
            if (!projectId) return;
            logger.debug('initializing socket for project', projectId);

            // Try to read token from localStorage or cookie. If not present,
            // poll briefly to allow E2E tests to inject the token before the
            // app initializes sockets. After timeout, initialize anyway so
            // the app remains functional for anonymous projects.
            const readToken = () => {
                let t = null;
                try { t = typeof window !== 'undefined' ? localStorage.getItem('token') : null; } catch (e) { t = null; }
                if (!t) {
                    try {
                        const m = (typeof document !== 'undefined' && document.cookie) ? document.cookie.match('(^|;)\\s*token\\s*=\\s*([^;]+)') : null;
                        if (m && m[2]) t = decodeURIComponent(m[2]);
                    } catch (e) { t = null; }
                }
                return t;
            };

            const maxWait = 5000; // ms
            const intervalMs = 200;
            let waited = 0;

            if (readToken()) {
                if (cancelled) return;
                socketRef.current = initializeSocket(projectId);
                return;
            }

            while (waited < maxWait && !cancelled) {
                await new Promise(r => setTimeout(r, intervalMs));
                waited += intervalMs;
                if (readToken()) break;
            }

            if (cancelled) return;
            socketRef.current = initializeSocket(projectId);
        };

        tryInit();

        return () => {
            cancelled = true;
            disconnectSocket();
        };
    }, [projectId]);

    const on = useCallback((eventName, cb) => {
        receiveMessage(eventName, cb);
    }, []);

    const off = useCallback((eventName, cb) => {
        removeListener(eventName, cb);
    }, []);

    const emit = useCallback((eventName, data) => {
        sendMessage(eventName, data);
    }, []);

    return {
        socket: socketRef.current,
        on,
        off,
        emit
    };
};
