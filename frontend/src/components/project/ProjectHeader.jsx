import React from 'react';
import PropTypes from 'prop-types';

const ProjectHeader = ({
  setIsModalOpen,
  setIsAIModalOpen,
  setIsSettingsOpen,
  setShowSearch,
  showSearch,
  searchTerm,
  setSearchTerm,
  setIsSidePanelOpen,
  isSidePanelOpen,
  isDarkMode,
  settings,
  t,
  onClearChat
}) => {
  const iconColor = isDarkMode ? '#fff' : '#1f2937';

  return (
    <header className="absolute top-0 z-10 flex items-center justify-between w-full p-2 px-4 bg-slate-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-gray-800 dark:text-white transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg focus:outline-none bg-transparent border-none"
        >
          <i className="ri-user-add-fill" style={{ color: iconColor }}></i>
          <span style={{ color: iconColor }}>{t('addUsers')}</span>
        </button>
        {settings.display?.aiAssistant && (
          <button className="p-2" title={t('aiAssistant')} onClick={() => setIsAIModalOpen(true)}>
            <i className="ri-robot-2-line" style={{ color: iconColor }}></i>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClearChat}
          className="p-2 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
          title="Clear Chat"
        >
          <i className="ri-delete-bin-7-line text-xl"></i>
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          title={t('settings')}
        >
          <i className="text-xl ri-settings-3-line" style={{ color: iconColor }}></i>
        </button>
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <i className="ri-search-eye-fill" style={{ color: iconColor }}></i>
          </button>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchMessages')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 p-2 text-sm text-gray-800 transition-all duration-300 bg-white border rounded dark:text-white dark:bg-gray-700"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchTerm('');
              }}
              className="absolute right-2 top-2"
            >
              <i className="ri-close-line" style={{ color: iconColor }}></i>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          className="p-2 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <i className="ri-user-community-line" style={{ color: iconColor }}></i>
        </button>
      </div>
    </header>
  );
};

ProjectHeader.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired,
  setIsAIModalOpen: PropTypes.func.isRequired,
  setIsSettingsOpen: PropTypes.func.isRequired,
  setShowSearch: PropTypes.func.isRequired,
  showSearch: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setIsSidePanelOpen: PropTypes.func.isRequired,
  isSidePanelOpen: PropTypes.bool.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired
};

export default React.memo(ProjectHeader);
