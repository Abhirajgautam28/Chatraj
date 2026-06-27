import { useEffect, useRef, useCallback } from 'react';
import { initializeSocket, disconnectSocket, receiveMessage, removeListener, sendMessage } from '../config/socket';
import { logger } from '../utils/logger';

export const useSocket = (projectId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let retryTimer = null;

        const initSocket = (token) => {
            if (!projectId || cancelled) return;
            logger.debug('initializing socket for project', projectId);
            socketRef.current = initializeSocket(projectId, token);
        };

        const tryInit = async () => {
            if (!projectId) return;
            logger.debug('initializing socket for project', projectId);

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

            const maxWait = 10000; // ms
            const intervalMs = 250;
            let waited = 0;
            let token = readToken();

            while (waited < maxWait && !cancelled) {
                if (token) {
                    initSocket(token);
                    return;
                }

                await new Promise(r => setTimeout(r, intervalMs));
                waited += intervalMs;
                token = readToken();
            }

            if (cancelled) return;

            const finalToken = readToken();
            if (finalToken) {
                initSocket(finalToken);
                return;
            }

            let attempts = 0;
            const retry = () => {
                if (cancelled) return;
                const nextToken = readToken();
                if (nextToken) {
                    initSocket(nextToken);
                    return;
                }
                attempts += 1;
                if (attempts < 8) {
                    retryTimer = window.setTimeout(retry, 1000);
                } else {
                    initSocket(null);
                }
            };
            retry();
        };

        tryInit();

        return () => {
            cancelled = true;
            if (retryTimer) {
                window.clearTimeout(retryTimer);
            }
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
