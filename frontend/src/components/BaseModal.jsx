import React, { useEffect, useRef } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const BaseModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-md',
    isDarkMode = false,
    showCloseButton = true
}) => {
    const modalRef = useRef(null);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="flex items-center justify-center min-h-screen p-4 outline-none"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
            closeTimeoutMS={300}
            contentLabel={title}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`w-full ${maxWidth} bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]`}
                        ref={modalRef}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                    aria-label="Close modal"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-50 dark:border-gray-800 flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
};

BaseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    footer: PropTypes.node,
    maxWidth: PropTypes.string,
    isDarkMode: PropTypes.bool,
    showCloseButton: PropTypes.bool,
};

export default React.memo(BaseModal);
