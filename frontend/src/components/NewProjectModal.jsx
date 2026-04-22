import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const NewProjectModal = ({ isOpen, onClose, projectName, setProjectName, onSubmit }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md p-8 transition duration-300 transform bg-gray-800 rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-6 text-2xl font-bold text-center text-white">
              Create New Project
            </h2>
            <form onSubmit={onSubmit}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="w-full p-3 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-5 py-2 mr-3 text-white transition duration-300 bg-gray-600 rounded hover:bg-gray-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

NewProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  setProjectName: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default NewProjectModal;
