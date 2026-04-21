import React from 'react';
import PropTypes from 'prop-types';

const ProjectSettingsModal = ({
  isOpen,
  onClose,
  activeSettingsTab,
  setActiveSettingsTab,
  settings,
  updateSettings,
  vimMode,
  setVimMode,
  modalPosition,
  setModalPosition,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
  settingsModalRef,
  t
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        ref={settingsModalRef}
        className="fixed z-50 w-full max-w-md bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 rounded-xl dark:border-gray-700"
        style={modalPosition ? {
          left: modalPosition.x,
          top: modalPosition.y,
          transform: 'none',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'default',
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={e => {
          if (isDragging) {
            setModalPosition({
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            });
          }
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b cursor-move select-none dark:bg-gray-800 dark:border-gray-700"
          style={{ userSelect: 'none' }}
          onMouseDown={e => {
            if (e.button !== 0) return;
            const rect = settingsModalRef.current.getBoundingClientRect();
            setIsDragging(true);
            setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            if (!modalPosition) {
              setModalPosition({
                x: rect.left,
                y: rect.top
              });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <i className="text-2xl ri-close-line"></i>
          </button>
        </div>
        <div className="flex px-6 bg-gray-100 border-b dark:border-gray-700 dark:bg-gray-700">
          {['display', 'behavior', 'accessibility', 'sidebar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSettingsTab(tab)}
              className={`px-4 py-2 text-base font-semibold border-b-4 transition-colors duration-150 focus:outline-none ${activeSettingsTab === tab
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400'
                : 'border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-transparent'
                }`}
              style={{ marginBottom: '-1px', borderRadius: '10px 10px 0 0' }}
            >
              {tab === 'accessibility' ? t('language') : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <div className="p-6 space-y-7">
            {activeSettingsTab === 'display' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between" title="Enable or disable Vim keybindings in the code editor.">
                  <span className="font-semibold text-gray-900 dark:text-white">Vim Mode (Editor)</span>
                  <button
                    onClick={() => setVimMode(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${vimMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vimMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                  <button
                    onClick={() => updateSettings('display', 'darkMode', !settings.display.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Theme Color</span>
                  <input
                    type="color"
                    value={settings.display.themeColor || '#3B82F6'}
                    onChange={e => updateSettings('display', 'themeColor', e.target.value)}
                    className="w-12 h-8 p-0 bg-transparent border-0"
                  />
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Chat Bubble Roundness</span>
                  <select
                    value={settings.display.bubbleRoundness || 'large'}
                    onChange={e => updateSettings('display', 'bubbleRoundness', e.target.value)}
                    className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Message Font Size</span>
                  <select
                    value={settings.display.messageFontSize || 'medium'}
                    onChange={e => updateSettings('display', 'messageFontSize', e.target.value)}
                    className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Enable Syntax Highlighting</span>
                  <button
                    onClick={() => updateSettings('display', 'syntaxHighlighting', !settings.display.syntaxHighlighting)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.syntaxHighlighting ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.syntaxHighlighting ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Show Avatars</span>
                  <button
                    onClick={() => updateSettings('display', 'showAvatars', !settings.display.showAvatars)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showAvatars ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showAvatars ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Show Timestamps</span>
                  <button
                    onClick={() => updateSettings('display', 'showTimestamps', !settings.display.showTimestamps)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.showTimestamps ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.showTimestamps ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Enable AI Assistant</span>
                  <button
                    onClick={() => updateSettings('display', 'aiAssistant', !settings.display.aiAssistant)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.display.aiAssistant ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.display.aiAssistant ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}
            {activeSettingsTab === 'behavior' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Auto Scroll</span>
                  <button
                    onClick={() => updateSettings('behavior', 'autoScroll', !settings.behavior.autoScroll)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.autoScroll ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.autoScroll ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Show System Messages</span>
                  <button
                    onClick={() => updateSettings('behavior', 'showSystemMessages', !settings.behavior.showSystemMessages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.showSystemMessages ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.showSystemMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Collapse Replies by Default</span>
                  <button
                    onClick={() => updateSettings('behavior', 'collapseReplies', !settings.behavior.collapseReplies)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.collapseReplies ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.collapseReplies ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Show Message Read Receipts</span>
                  <button
                    onClick={() => updateSettings('behavior', 'showReadReceipts', !settings.behavior.showReadReceipts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.showReadReceipts ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.showReadReceipts ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Enter to Send</span>
                  <button
                    onClick={() => updateSettings('behavior', 'enterToSend', !settings.behavior.enterToSend)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.behavior.enterToSend ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.behavior.enterToSend ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}
            {activeSettingsTab === 'accessibility' && (
              <div className="space-y-4">
                <div>
                  <span className="block mb-1 font-semibold text-gray-900 dark:text-white">Language</span>
                  <select
                    value={settings.accessibility?.language || 'en-US'}
                    onChange={e => updateSettings('accessibility', 'language', e.target.value)}
                    className="w-full p-2 mt-1 bg-white border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                    <option value="es-ES">Español (Spanish)</option>
                    <option value="fr-FR">Français (French)</option>
                    <option value="de-DE">Deutsch (German)</option>
                    <option value="ja-JP">日本語 (Japanese)</option>
                  </select>
                </div>
              </div>
            )}
            {activeSettingsTab === 'sidebar' && (
              <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner border dark:border-gray-700">
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Show File Tree</span>
                  <button
                    onClick={() => updateSettings('sidebar', 'showFileTree', !settings.sidebar?.showFileTree)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.showFileTree ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-pressed={settings.sidebar?.showFileTree}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.showFileTree ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Show Collaborators List</span>
                  <button
                    onClick={() => updateSettings('sidebar', 'showCollaborators', !settings.sidebar?.showCollaborators)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.showCollaborators ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-pressed={settings.sidebar?.showCollaborators}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.showCollaborators ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Pin Sidebar</span>
                  <button
                    onClick={() => updateSettings('sidebar', 'pinSidebar', !settings.sidebar?.pinSidebar)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${settings.sidebar?.pinSidebar ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-pressed={settings.sidebar?.pinSidebar}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.sidebar?.pinSidebar ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="py-2">
                  <span className="block mb-2 font-medium text-gray-900 dark:text-white">Sidebar Width</span>
                  <input
                    type="range"
                    min={180}
                    max={400}
                    value={settings.sidebar?.sidebarWidth || 240}
                    onChange={e => updateSettings('sidebar', 'sidebarWidth', Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">{settings.sidebar?.sidebarWidth || 240}px</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

ProjectSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeSettingsTab: PropTypes.string.isRequired,
  setActiveSettingsTab: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
  vimMode: PropTypes.bool.isRequired,
  setVimMode: PropTypes.func.isRequired,
  modalPosition: PropTypes.object,
  setModalPosition: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
  dragOffset: PropTypes.object.isRequired,
  setDragOffset: PropTypes.func.isRequired,
  settingsModalRef: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default ProjectSettingsModal;
