import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCard = ({ project, idx, onClick, onDelete, onLeave, currentUserId }) => {
  const [showOptions, setShowOptions] = useState(false);
  const isCreator = project.createdBy === currentUserId || project.createdBy?._id === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: idx * 0.05, type: 'spring', damping: 20 }}
      className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-black/5 hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
          <i className="ri-folder-6-line text-2xl"></i>
        </div>

        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
                <i className="ri-more-2-fill text-xl"></i>
            </button>

            <AnimatePresence>
                {showOptions && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 z-20"
                        >
                            {isCreator ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowOptions(false); onDelete(project._id); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                    <i className="ri-delete-bin-line"></i> Delete Project
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowOptions(false); onLeave(project._id); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all"
                                >
                                    <i className="ri-logout-box-r-line"></i> Leave Project
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
        {project.name}
      </h3>

      <div className="flex items-center gap-2 mb-6">
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider">
          {project.category || 'General'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
        <div className="flex -space-x-2">
          {(project.users || []).slice(0, 3).map((u, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
              {u.firstName?.[0] || 'U'}
            </div>
          ))}
          {(project.users?.length || 0) > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{(project.users.length) - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
          <i className="ri-user-line"></i>
          {project.users?.length || 0} collaborators
        </div>
      </div>
    </motion.div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired
};

export default React.memo(ProjectCard);
