import React from 'react';
import PropTypes from 'prop-types';

const ChatRajSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  settings,
  handleNewChat,
  t,
  isDarkMode
}) => {
  return (
    <div
      className={`sidebar fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: settings.sidebar.width }}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <i className="ri-robot-2-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ChatRaj</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <i className="ri-menu-fold-line text-xl"></i>
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-3 w-full p-3 mb-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <i className="ri-add-line text-xl"></i>
          <span className="font-medium">{t('newChat')}</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Recent chats could go here */}
          <div className="px-2 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Conversations
          </div>
          <div className="space-y-1">
            <div className="p-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors flex items-center gap-3">
              <i className="ri-chat-3-line"></i>
              <span className="truncate text-black dark:text-white">General Discussion</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">User</div>
              <div className="text-xs text-gray-500 truncate">Free Plan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ChatRajSidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  handleNewChat: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default ChatRajSidebar;
