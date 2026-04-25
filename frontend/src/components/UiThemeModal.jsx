import React from 'react';
import PropTypes from 'prop-types';
import BaseModal from './BaseModal.jsx';
import useTheme from '../context/useTheme';

const UiThemeModal = ({ isOpen, onRequestClose }) => {
  const { uiTheme, setUiThemeGlobal, isDarkMode } = useTheme();

  const themes = [
    { id: 'default', name: 'Default', icon: 'ri-layout-line' },
    { id: 'glassmorphism', name: 'Glassmorphism', icon: 'ri-window-line' },
    { id: 'claymorphism', name: 'Claymorphism', icon: 'ri-shape-line' },
    { id: 'liquidglass', name: 'Liquid Glass', icon: 'ri-drop-line' },
    { id: 'minimalist', name: 'Modern Minimal', icon: 'ri-artboard-line' },
    { id: 'oneui', name: 'One UI', icon: 'ri-smartphone-line' }
  ];

  const handleSelect = (themeId) => {
    setUiThemeGlobal(themeId);
    setTimeout(() => {
        onRequestClose();
    }, 600); // Close slightly after animation starts
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Select UI Theme">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {themes.map((theme) => {
          const isActive = uiTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                <i className={`${theme.icon} text-xl`}></i>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                  {theme.name}
                </span>
                {isActive && <span className="text-xs text-blue-500 dark:text-blue-400 mt-1">Active</span>}
              </div>
            </button>
          );
        })}
      </div>
    </BaseModal>
  );
};

UiThemeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

export default UiThemeModal;
