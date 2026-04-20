import React, { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`pointer-events-auto min-w-[250px] max-w-md px-4 py-3 rounded-xl shadow-2xl text-white flex items-center justify-between gap-3 backdrop-blur-md ${
                                toast.type === 'success' ? 'bg-green-600/90' :
                                toast.type === 'error' ? 'bg-red-600/90' :
                                toast.type === 'warning' ? 'bg-yellow-600/90' : 'bg-blue-600/90'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <i className={`text-xl ${
                                    toast.type === 'success' ? 'ri-checkbox-circle-fill' :
                                    toast.type === 'error' ? 'ri-error-warning-fill' :
                                    toast.type === 'warning' ? 'ri-alert-fill' : 'ri-info-card-fill'
                                }`}></i>
                                <span className="font-medium">{toast.message}</span>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
