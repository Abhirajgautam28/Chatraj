import React from 'react';
import PropTypes from 'prop-types';

const EditorStatusBar = ({ fileName, language, line, col, isDarkMode }) => {
  return (
    <div className={`flex items-center px-4 py-1 text-xs ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-slate-200 text-gray-700'} w-full border-t border-gray-300 dark:border-gray-700`} style={{ fontFamily: 'monospace' }}>
      <span className="mr-4">Ln {line}, Col {col}</span>
      <span className="mr-4">Spaces: 2</span>
      <span className="mr-4">UTF-8</span>
      <span className="mr-4">{language}</span>
      <span className="ml-auto">{fileName}</span>
    </div>
  );
};

EditorStatusBar.propTypes = {
  fileName: PropTypes.string,
  language: PropTypes.string,
  line: PropTypes.number,
  col: PropTypes.number,
  isDarkMode: PropTypes.bool
};

export default EditorStatusBar;
