import React from 'react';
import PropTypes from 'prop-types';

const ChatRajHeader = ({ isSidebarOpen, setIsSidebarOpen, setIsSettingsOpen, t }) => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <i className="ri-menu-2-line text-xl"></i>
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {t('welcomeMessage')}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={t('settings')}
          aria-label="Settings"
        >
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>
    </header>
  );
};

ChatRajHeader.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  setIsSettingsOpen: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default React.memo(ChatRajHeader);
