import React from 'react';
import PropTypes from 'prop-types';

const EditorToolbar = ({ onAction, isDarkMode }) => {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-slate-100 border-gray-300'} sticky top-0 z-10`}>
      <button title="Explorer" onClick={() => onAction('explorer')} className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">
        <i className="ri-file-list-2-line text-lg"></i>
      </button>
      <button title="Search" onClick={() => onAction('search')} className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">
        <i className="ri-search-eye-line text-lg"></i>
      </button>
      <button title="Source Control" onClick={() => onAction('sourceControl')} className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">
        <i className="ri-git-branch-line text-lg"></i>
      </button>
      <button title="Run & Debug" onClick={() => onAction('runDebug')} className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">
        <i className="ri-play-line text-lg"></i>
      </button>
      <button title="Extensions" onClick={() => onAction('extensions')} className="p-2 rounded hover:bg-blue-100 dark:hover:bg-gray-800">
        <i className="ri-puzzle-line text-lg"></i>
      </button>
      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Editor Toolbar</span>
    </div>
  );
};

EditorToolbar.propTypes = {
  onAction: PropTypes.func,
  isDarkMode: PropTypes.bool
};

export default EditorToolbar;
