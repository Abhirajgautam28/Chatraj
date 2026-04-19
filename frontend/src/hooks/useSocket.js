import { useEffect, useRef, useCallback } from 'react';
import { initializeSocket, disconnectSocket, receiveMessage, removeListener, sendMessage } from '../config/socket';

export const useSocket = (projectId) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (projectId) {
            socketRef.current = initializeSocket(projectId);
        }

        return () => {
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
