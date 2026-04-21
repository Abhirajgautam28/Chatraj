import React, { useContext } from 'react';
import { ThemeContext } from '../context/theme.context';
import { motion, AnimatePresence } from 'framer-motion';

const DarkModeToggle = () => {
    const { isDarkMode, toggleThemeGlobal } = useContext(ThemeContext);

    const handleToggle = () => {
        const isHome = window.location.pathname === '/';
        toggleThemeGlobal(false, isHome);
    };

    return (
        <button
            onClick={handleToggle}
            className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 overflow-hidden"
            aria-label="Toggle dark mode"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                    <motion.div
                        key="moon"
                        initial={{ y: -30, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 30, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className="text-gray-200"
                    >
                        <i className="ri-moon-clear-fill text-2xl"></i>
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: -30, opacity: 0, rotate: 90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 30, opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className="text-amber-500"
                    >
                        <i className="ri-sun-fill text-2xl"></i>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};

export default DarkModeToggle;
