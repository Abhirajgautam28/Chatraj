import React from 'react';
import PropTypes from 'prop-types';

const ChatRajMessage = React.memo(({ message, index, settings, formatMessageTime }) => (
    <div
        key={index}
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
        <div className={`max-w-[80%] px-4 py-3 ${settings.display.chatBubbles.roundness} ${message.type === 'user'
                ? 'text-white'
                : 'text-black dark:text-white'
            }`}
            style={{
                backgroundColor: message.type === 'user' ? 'var(--primary-color)' : 'var(--secondary-bg-color)',
            }}
        >
            <p className={`${settings.display.typography.fontFamily} ${message.type === 'user'
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
));

ChatRajMessage.displayName = 'ChatRajMessage';

ChatRajMessage.propTypes = {
    message: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    settings: PropTypes.object.isRequired,
    formatMessageTime: PropTypes.func.isRequired
};

export default ChatRajMessage;
