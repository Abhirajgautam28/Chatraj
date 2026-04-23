import React from 'react';
import PropTypes from 'prop-types';
import ChatRajMessage from '../ChatRajMessage';

const ChatRajMessageList = ({ messages, isThinking, settings, t, formatMessageTime, messageEndRef, setInputMessage, handleSubmit }) => {
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-20">
        <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-bounce">
          <i className="ri-robot-2-line text-white text-5xl"></i>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('welcomeMessage')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('welcomeSubtext')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {[
            "Explain React Hooks in simple terms",
            "Write a Python script for web scraping",
            "How to center a div with Tailwind?",
            "Give me creative ideas for a web project"
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => {
                setInputMessage(prompt);
                handleSubmit({ preventDefault: () => {} }, prompt);
              }}
              className="p-4 text-sm text-left text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-500 transition-all shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {messages.map((msg, index) => (
        <ChatRajMessage
          key={index}
          msg={msg}
          settings={settings}
          isDarkMode={settings.display.darkMode}
          formatMessageTime={formatMessageTime}
        />
      ))}
      {isThinking && (
        <div className="flex justify-start">
          <div className={`px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3`}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-xs font-medium text-gray-500">{t('thinking')}</span>
          </div>
        </div>
      )}
      <div ref={messageEndRef} />
    </div>
  );
};

ChatRajMessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  isThinking: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  formatMessageTime: PropTypes.func.isRequired,
  messageEndRef: PropTypes.object.isRequired,
  setInputMessage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default React.memo(ChatRajMessageList);
