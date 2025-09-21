import { useRef, useState } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import ToggleRow from './ToggleRow';
import PropTypes from 'prop-types';

export default function SettingsModal({ settings, updateSettings, onClose, t }) {
    const ref = useRef();
    const { style } = useDraggable(ref);
    const [activeTab, setActiveTab] = useState('display');

    const displayFields = [
        { key: 'darkMode', label: 'Dark Mode' },
        { key: 'showAvatars', label: 'Show Avatars' },
        { key: 'showTimestamps', label: 'Show Timestamps' },
        { key: 'aiAssistant', label: 'Enable AI Assistant' },
        { key: 'syntaxHighlighting', label: 'Enable Syntax Highlighting' },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div
                ref={ref}
                className="fixed z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
                style={{ ...style, maxHeight: 'calc(100vh - 80px)', overflow: 'hidden' }}
            >
                <header className="sticky top-0 flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 cursor-move">
                    <h2 className="text-xl font-bold">{t ? t('settings') : 'Settings'}</h2>
                    <button onClick={onClose}><i className="ri-close-line text-2xl" /></button>
                </header>
                <nav className="flex px-6 bg-gray-100 dark:bg-gray-700 border-b">
                    {['display', 'behavior', 'accessibility', 'sidebar'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={activeTab === tab
                                ? 'border-b-4 border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-blue-600'
                            }
                        >
                            {tab === 'accessibility' ? (t ? t('language') : 'Language') : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    {activeTab === 'display' && (
                        <div className="space-y-4">
                            {displayFields.map(f => (
                                <ToggleRow
                                    key={f.key}
                                    label={t ? t(f.label) : f.label}
                                    checked={settings.display[f.key]}
                                    onChange={() => updateSettings('display', f.key, !settings.display[f.key])}
                                />
                            ))}
                            {/* color picker, selects, etc can be pulled into similar mini components */}
                        </div>
                    )}
                    {/* ...other tabs can be refactored similarly... */}
                </div>
            </div>
        </>
    );
}

SettingsModal.propTypes = {
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    t: PropTypes.func,
};
