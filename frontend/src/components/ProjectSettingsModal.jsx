import React from 'react';
import PropTypes from 'prop-types';

const ProjectSettingsModal = ({
    isOpen, onClose, settings, updateSettings, activeTab, setActiveTab, t, isDarkMode, vimMode, setVimMode
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">{t('settings')}</h2>
                    <button onClick={onClose} className="text-2xl dark:text-gray-400">&times;</button>
                </header>
                <div className="flex bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-700">
                    {['display', 'behavior', 'accessibility', 'sidebar'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                    ))}
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {activeTab === 'display' && (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="dark:text-white">Vim Mode</span>
                                <input type="checkbox" checked={vimMode} onChange={e => setVimMode(e.target.checked)} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="dark:text-white">Dark Mode</span>
                                <input type="checkbox" checked={settings.display.darkMode} onChange={() => updateSettings('display', 'darkMode', !settings.display.darkMode)} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

ProjectSettingsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool,
    vimMode: PropTypes.bool,
    setVimMode: PropTypes.func
};

export default ProjectSettingsModal;
