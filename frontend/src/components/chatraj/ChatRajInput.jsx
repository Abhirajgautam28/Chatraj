import React from 'react';
import PropTypes from 'prop-types';

const ChatRajInput = ({
  handleSubmit,
  inputRef,
  inputMessage,
  setInputMessage,
  settings,
  startListening,
  isListening,
  isThinking,
  t
}) => {
  return (
    <footer className="p-4 md:p-6 bg-transparent sticky bottom-0">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white dark:bg-gray-900 p-2 pl-4 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && settings.behavior.enterToSend) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={t('typeAMessage') || "Type a message..."}
            className="flex-1 max-h-48 py-2.5 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white scrollbar-hide"
          />
          <div className="flex items-center gap-1">
            {settings.accessibility.speechToText && (
              <button
                type="button"
                onClick={startListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Start listening"
              >
                <i className="ri-mic-2-line text-xl"></i>
              </button>
            )}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isThinking}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
              aria-label="Send message"
            >
              <i className="ri-send-plane-2-fill text-xl"></i>
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
          {t('disclaimer')}
        </p>
      </div>
    </footer>
  );
};

ChatRajInput.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired,
  inputMessage: PropTypes.string.isRequired,
  setInputMessage: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  startListening: PropTypes.func.isRequired,
  isListening: PropTypes.bool.isRequired,
  isThinking: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default React.memo(ChatRajInput);
