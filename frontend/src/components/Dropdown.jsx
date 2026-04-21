import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({ label, icon, options, value, onChange, isOpen, onToggle }) => {
  return (
    <div className="relative dropdown-container">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-200 border ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
            : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-blue-500'
        }`}
        title={label}
      >
        <i className={icon}></i>
        <span className="text-sm font-semibold hidden lg:block">{label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  onChange(opt.key);
                  onToggle();
                }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  value === opt.key
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {opt.icon && <i className={`${opt.icon} text-lg`}></i>}
                <span className="flex-1 text-left">{opt.label}</span>
                {value === opt.key && <i className="ri-check-line text-lg"></i>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default React.memo(Dropdown);
