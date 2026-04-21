import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';
import SyntaxHighlightedCode from './SyntaxHighlightedCode';

const ChatRajMessage = memo(({
  msg,
  settings,
  isDarkMode,
  formatMessageTime
}) => {
  const isUser = msg.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] md:max-w-[75%] space-y-1`}>
        <div
          className={`px-4 py-3 ${settings.display.chatBubbles.roundness} ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          } ${settings.display.chatBubbles.shadow ? 'shadow-lg shadow-black/5' : ''} ${
            settings.display.typography.userMessageSize
          }`}
          style={isUser ? { backgroundColor: settings.display.theme.primary } : {}}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              options={{
                overrides: {
                  code: {
                    component: SyntaxHighlightedCode,
                    props: {
                      className: 'rounded-md my-2'
                    }
                  }
                }
              }}
            >
              {msg.content}
            </Markdown>
          </div>
        </div>

        {settings.sidebar.showTimestamps && (
          <div className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatMessageTime(msg.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
});

ChatRajMessage.displayName = 'ChatRajMessage';

ChatRajMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  formatMessageTime: PropTypes.func.isRequired,
};

export default ChatRajMessage;
