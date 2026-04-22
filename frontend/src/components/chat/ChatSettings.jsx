import React from 'react';
import PropTypes from 'prop-types';

const ChatSettings = ({
  isSettingsOpen,
  setIsSettingsOpen,
  activeSettingsTab,
  setActiveSettingsTab,
  settings,
  updateSettings,
  updateNestedSettings,
  isChatRajDarkMode,
  setIsChatRajDarkMode,
  languages,
  clearChatHistory,
  handlePrivacyToggle,
  t
}) => {
  if (!isSettingsOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={() => setIsSettingsOpen(false)}
      />
      <div
        className="fixed bottom-24 left-8 z-50 w-[480px] max-w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        style={{
          maxHeight: 'calc(100vh - 180px)',
          overflow: 'hidden',
          transition: 'box-shadow 0.18s',
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <i className="text-2xl ri-close-line"></i>
          </button>
        </div>

        {/* Horizontal tab bar */}
        <div className="flex border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-700 px-7 overflow-x-auto">
          {['display', 'behavior', 'accessibility', 'sidebar', 'privacy'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSettingsTab(tab)}
              className={`px-6 py-3 text-base font-semibold border-b-4 transition-colors duration-150 focus:outline-none whitespace-nowrap ${
                activeSettingsTab === tab
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400'
                  : 'border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-transparent'
              }`}
              style={{ marginBottom: '-1px', borderRadius: '10px 10px 0 0' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-7 space-y-7">
            {activeSettingsTab === 'display' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">{t('darkMode')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                  </div>
                  <button
                    onClick={() => setIsChatRajDarkMode(!isChatRajDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isChatRajDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isChatRajDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-black dark:text-white">{t('themeColors')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Primary Color</label>
                      <input
                        type="color"
                        value={settings.display.theme.primary}
                        onChange={(e) => {
                          updateNestedSettings('display', 'theme', 'primary', e.target.value);
                        }}
                        className="w-full h-10 mt-1 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-black dark:text-white">{t('chatBubbles')}</label>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Roundness</label>
                      <select
                        value={settings.display.chatBubbles.roundness}
                        onChange={(e) => updateNestedSettings('display', 'chatBubbles', 'roundness', e.target.value)}
                        className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="rounded-sm">Minimal</option>
                        <option value="rounded-lg">Normal</option>
                        <option value="rounded-xl">Large</option>
                        <option value="rounded-3xl">Extra Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Message Font Size</label>
                      <select
                        value={settings.display.typography.userMessageSize}
                        onChange={(e) => updateNestedSettings('display', 'typography', 'userMessageSize', e.target.value)}
                        className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="text-xs">Small</option>
                        <option value="text-sm">Medium</option>
                        <option value="text-base">Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Message Shadows</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add shadows to message bubbles</p>
                  </div>
                  <button
                    onClick={() => updateNestedSettings('display', 'chatBubbles', 'shadow', !settings.display.chatBubbles.shadow)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.display.chatBubbles.shadow ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.display.chatBubbles.shadow ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeSettingsTab === 'behavior' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Enter to Send</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use Enter key to send messages</p>
                  </div>
                  <button
                    onClick={() => updateSettings('behavior', 'enterToSend', !settings.behavior.enterToSend)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.behavior.enterToSend ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.behavior.enterToSend ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Auto Complete</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enable message auto-completion</p>
                  </div>
                  <button
                    onClick={() => updateSettings('behavior', 'autoComplete', !settings.behavior.autoComplete)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.behavior.autoComplete ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.behavior.autoComplete ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeSettingsTab === 'accessibility' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Language</label>
                  <select
                    value={settings.accessibility.language}
                    onChange={(e) => updateSettings('accessibility', 'language', e.target.value)}
                    className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    {Object.entries(languages).map(([code, lang]) => (
                      <option key={code} value={code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeSettingsTab === 'sidebar' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">Sidebar Width</label>
                  <select
                    value={settings.sidebar.width}
                    onChange={(e) => updateSettings('sidebar', 'width', e.target.value)}
                    className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="220px">Narrow</option>
                    <option value="260px">Default</option>
                    <option value="300px">Wide</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Auto Expand on Hover</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatically expand sidebar when hovering</p>
                  </div>
                  <button
                    onClick={() => updateSettings('sidebar', 'autoExpand', !settings.sidebar.autoExpand)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sidebar.autoExpand ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sidebar.autoExpand ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Show Timestamps</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Display message timestamps</p>
                  </div>
                  <button
                    onClick={() => updateSettings('sidebar', 'showTimestamps', !settings.sidebar.showTimestamps)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sidebar.showTimestamps ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sidebar.showTimestamps ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {activeSettingsTab === 'privacy' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Save Chat History</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Store conversations locally</p>
                  </div>
                  <button
                    onClick={handlePrivacyToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.saveHistory ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.saveHistory ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">Auto Delete Messages</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatically delete old messages</p>
                  </div>
                  <button
                    onClick={() => updateNestedSettings('privacy', 'autoDelete', 'enabled', !settings.privacy.autoDelete.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.autoDelete.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.autoDelete.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {settings.privacy.autoDelete.enabled && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black dark:text-white">Auto Delete After</label>
                    <select
                      value={settings.privacy.autoDelete.days}
                      onChange={(e) => updateNestedSettings('privacy', 'autoDelete', 'days', Number(e.target.value))}
                      className="w-full p-2 text-sm bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                        clearChatHistory();
                      }
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Clear All Chat History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

ChatSettings.propTypes = {
  isSettingsOpen: PropTypes.bool.isRequired,
  setIsSettingsOpen: PropTypes.func.isRequired,
  activeSettingsTab: PropTypes.string.isRequired,
  setActiveSettingsTab: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  updateNestedSettings: PropTypes.func.isRequired,
  isChatRajDarkMode: PropTypes.bool.isRequired,
  setIsChatRajDarkMode: PropTypes.func.isRequired,
  languages: PropTypes.object.isRequired,
  clearChatHistory: PropTypes.func.isRequired,
  handlePrivacyToggle: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default ChatSettings;
