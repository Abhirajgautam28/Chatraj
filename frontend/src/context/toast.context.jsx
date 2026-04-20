import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timeoutsRef = useRef({});

    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        timeoutsRef.current[id] = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            delete timeoutsRef.current[id];
        }, duration);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-6 py-3 rounded-lg shadow-lg text-white transition-all transform animate-fade-in-up ${
                            toast.type === 'error' ? 'bg-red-600' :
                            toast.type === 'success' ? 'bg-green-600' :
                            'bg-blue-600'
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
