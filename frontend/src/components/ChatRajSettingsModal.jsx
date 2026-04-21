import React from 'react';
import PropTypes from 'prop-types';

const ChatRajSettingsModal = ({
  isOpen,
  onClose,
  activeSettingsTab,
  setActiveSettingsTab,
  settings,
  updateSettings,
  updateNestedSettings,
  handlePrivacyToggle,
  clearChatHistory,
  t,
  languages
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[calc(80vh-80px)]">
          <div className="w-full md:w-48 bg-gray-50 dark:bg-gray-800/50 p-4 border-r border-gray-100 dark:border-gray-800">
            <nav className="flex flex-row md:flex-col gap-2">
              {[
                { id: 'display', icon: 'ri-palette-line', label: 'Display' },
                { id: 'behavior', icon: 'ri-settings-4-line', label: 'Behavior' },
                { id: 'accessibility', icon: 'ri-user-voice-line', label: 'Accessibility' },
                { id: 'sidebar', icon: 'ri-side-bar-line', label: 'Sidebar' },
                { id: 'privacy', icon: 'ri-shield-keyhole-line', label: 'Privacy' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSettingsTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeSettingsTab === 'display' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-black dark:text-white">{t('darkMode')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark and light themes</p>
                  </div>
                  <button
                    onClick={() => updateSettings('display', 'darkMode', !settings.display.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.display.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.display.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-black dark:text-white">{t('themeColors')}</label>
                  <div className="flex gap-3">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateNestedSettings('display', 'theme', 'primary', color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          settings.display.theme.primary === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('enterToSend')}</label>
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('autoComplete')}</label>
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
                  <label className="text-sm font-medium text-black dark:text-white">{t('language')}</label>
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
                  <label className="text-sm font-medium text-black dark:text-white">{t('sidebarWidth')}</label>
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('autoExpand')}</label>
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('showTimestamps')}</label>
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('saveHistory')}</label>
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
                    <label className="text-sm font-medium text-black dark:text-white">{t('autoDelete')}</label>
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
                    onClick={clearChatHistory}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                  >
                    {t('clearHistory')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ChatRajSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeSettingsTab: PropTypes.string.isRequired,
  setActiveSettingsTab: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  updateNestedSettings: PropTypes.func.isRequired,
  handlePrivacyToggle: PropTypes.func.isRequired,
  clearChatHistory: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  languages: PropTypes.object.isRequired,
};

export default ChatRajSettingsModal;
