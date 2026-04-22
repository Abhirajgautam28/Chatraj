import React from 'react';
import PropTypes from 'prop-types';
import BaseModal from './BaseModal';

const CreateProjectModal = ({ isOpen, onClose, projectName, setProjectName, onSubmit, isSubmitting }) => {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Project"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting || !projectName.trim()}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                    Give your project a name to get started. You can add collaborators later.
                </p>
                <div>
                    <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Project Name
                    </label>
                    <input
                        id="projectName"
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. My Awesome App"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                        autoFocus
                    />
                </div>
            </div>
        </BaseModal>
    );
};

CreateProjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    setProjectName: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

export default React.memo(CreateProjectModal);
