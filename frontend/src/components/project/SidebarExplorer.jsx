import React from 'react';
import PropTypes from 'prop-types';
import FileIcon from '../FileIcon';
import Avatar from '../Avatar';

const SidebarExplorer = ({
  settings,
  fileTree,
  setCurrentFile,
  setOpenFiles,
  openFiles,
  project,
  isDarkMode,
  t
}) => {
  return (
    <div
      className="h-full explorer bg-slate-200 dark:bg-gray-500 overflow-y-auto"
      style={{
        maxWidth: settings.sidebar?.sidebarWidth || 240,
        minWidth: settings.sidebar?.sidebarWidth || 240,
        position: settings.sidebar?.pinSidebar ? 'sticky' : 'relative',
        left: 0,
        top: 0,
        zIndex: settings.sidebar?.pinSidebar ? 20 : 'auto',
        boxShadow: settings.sidebar?.pinSidebar ? '2px 0 8px rgba(0,0,0,0.08)' : undefined,
      }}
    >
      <div className="flex flex-col w-full p-2">
        {settings.sidebar?.showFileTree !== false && (
          <div className="file-tree space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-2 px-2">{t('files')}</h3>
            {fileTree && Object.keys(fileTree).length > 0 ? (
              Object.keys(fileTree).map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className="flex items-center w-full gap-2 p-2 px-3 cursor-pointer rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors bg-transparent text-gray-800 dark:text-white"
                >
                  <FileIcon fileName={file} />
                  <span className="text-sm font-medium truncate">{file}</span>
                </button>
              ))
            ) : (
              <div className="text-gray-400 dark:text-gray-400 p-2 text-xs italic">{t('noFiles')}</div>
            )}
          </div>
        )}

        {settings.sidebar?.showCollaborators && project.users && (
          <div className="collaborators-list mt-6 px-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-3">{t('collaborators')}</h3>
            <div className="flex flex-col gap-2">
              {project.users.map((u) => (
                <div key={u._id} className="flex items-center gap-3 group">
                  <Avatar firstName={u.firstName} className="w-7 h-7 text-[10px]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                    {u.firstName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SidebarExplorer.propTypes = {
  settings: PropTypes.object.isRequired,
  fileTree: PropTypes.object.isRequired,
  setCurrentFile: PropTypes.func.isRequired,
  setOpenFiles: PropTypes.func.isRequired,
  openFiles: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default React.memo(SidebarExplorer);
