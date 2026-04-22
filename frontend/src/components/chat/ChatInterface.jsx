import React from 'react';
import PropTypes from 'prop-types';

const ChatInterface = ({
  messages,
  searchTerm,
  isThinking,
  t,
  settings,
  messageEndRef,
  formatMessageTime
}) => {
  const filteredMessages = searchTerm
    ? messages.filter(message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative max-w-3xl px-4 py-6 mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <i className="text-6xl ri-robot-2-line" style={{ color: 'var(--robot-icon-color)' }}></i>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              {t('welcomeMessage')}
            </h1>
            <p className="text-sm text-black dark:text-white">
              {t('welcomeSubtext')}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 ${settings.display.chatBubbles.roundness} ${
                  message.type === 'user'
                    ? 'text-white'
                    : 'text-black dark:text-white'
                }`}
                style={{
                  backgroundColor: message.type === 'user' ? 'var(--primary-color)' : 'var(--secondary-bg-color)',
                  boxShadow: settings.display.chatBubbles.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                }}
              >
                <p className={`${settings.display.typography.fontFamily} ${
                  message.type === 'user'
                    ? settings.display.typography.userMessageSize
                    : settings.display.typography.aiMessageSize
                }`}>
                  {message.content}
                </p>
                {settings.sidebar.showTimestamps && (
                  <p className="mt-1 text-xs opacity-75">
                    {formatMessageTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {isThinking && (
          <div className="flex items-center gap-2 text-sm text-black dark:text-white">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span>{t('thinking')}</span>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
};

ChatInterface.propTypes = {
  messages: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  isThinking: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  messageEndRef: PropTypes.object.isRequired,
  formatMessageTime: PropTypes.func.isRequired
};

export default ChatInterface;
