import React from 'react';
import PropTypes from 'prop-types';

const ChatSidebar = ({
  isSidebarOpen, setIsSidebarOpen, settings, user, navigate, handleNewChat, t
}) => {
  return (
    <div
      className="sidebar fixed left-0 h-full z-10 transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      style={{
        width: isSidebarOpen ? settings.sidebar.width : '0px'
      }}
    >
      <div className="flex flex-col h-full pt-16">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--button-bg-color)' }}
          >
            <i className="text-lg ri-add-line"></i>
            {t('newChat')}
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {/* Recent chats could go here */}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {settings.sidebar.showUserInfo && (
            <div className="flex items-center gap-3 p-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 text-sm text-white bg-blue-500 rounded-full">
                {user?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                {user?.firstName}
              </span>
            </div>
          )}

          <button
            onClick={() => navigate('/categories')}
            className="flex items-center w-full gap-3 p-2 mb-2 text-black transition-colors rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <i className="ri-arrow-go-back-fill"></i>
            <span className="text-sm font-medium">Categories</span>
          </button>

          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center w-full gap-3 p-2 mb-2 text-black transition-colors rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <i className="ri-newspaper-line"></i>
            <span className="text-sm font-medium">Blogs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ChatSidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  user: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  handleNewChat: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default ChatSidebar;
