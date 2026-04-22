import React from 'react';
import PropTypes from 'prop-types';

const AIAssistantModal = ({
  isOpen,
  onClose,
  aiInput,
  setAiInput,
  aiResponse,
  aiLoading,
  handleAISend
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <button
          className="absolute text-gray-500 top-2 right-2 hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
        >
          <i className="text-2xl ri-close-line"></i>
        </button>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
        <input
          type="text"
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder="Ask ChatRaj..."
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (aiInput.trim()) handleAISend();
            }
          }}
          autoFocus
        />
        <button
          className="w-full py-2 mb-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleAISend}
          disabled={aiLoading || !aiInput.trim()}
        >
          {aiLoading ? 'Thinking...' : 'Send'}
        </button>
        {aiResponse && (
          <div className="p-2 mt-2 text-gray-800 whitespace-pre-wrap bg-gray-100 rounded dark:bg-gray-700 dark:text-white max-h-60 overflow-auto">
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
};

AIAssistantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  aiInput: PropTypes.string.isRequired,
  setAiInput: PropTypes.func.isRequired,
  aiResponse: PropTypes.string,
  aiLoading: PropTypes.bool.isRequired,
  handleAISend: PropTypes.func.isRequired,
};

export default AIAssistantModal;
