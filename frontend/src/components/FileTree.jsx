import React from 'react';
import PropTypes from 'prop-types';
import FileIcon from './FileIcon';

const FileTree = ({ fileTree, onFileClick, currentFile, isDarkMode }) => {
    if (!fileTree || Object.keys(fileTree).length === 0) return <div className="text-gray-500 dark:text-gray-300 p-4 italic">No files found.</div>;
    return (
        <div className="file-tree flex-grow overflow-auto">
            {Object.keys(fileTree).map((file) => (
                <button key={file} onClick={() => onFileClick(file)} className={`flex items-center w-full gap-2 p-2 px-4 cursor-pointer transition-colors ${currentFile === file ? "bg-slate-400 dark:bg-gray-600" : "hover:bg-slate-300 dark:hover:bg-gray-700"} dark:text-white`}>
                    <FileIcon fileName={file} />
                    <p className="text-base font-medium truncate">{file}</p>
                </button>
            ))}
        </div>
    );
};

FileTree.propTypes = {
    fileTree: PropTypes.object,
    onFileClick: PropTypes.func.isRequired,
    currentFile: PropTypes.string,
    isDarkMode: PropTypes.bool
};

export default FileTree;
