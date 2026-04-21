import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import ChatMessage from '../ChatMessage';

const MessageList = ({
  groupedMessages,
  user,
  messages,
  project,
  isDarkMode,
  bubbleRoundnessClass,
  messageFontSizeClass,
  getUserBubbleStyle,
  toggleEmojiPicker,
  messageEmojiPickers,
  handleReaction,
  setReplyingTo,
  expandedReplies,
  setExpandedReplies,
  settings,
  getMessageStatus,
  SyntaxHighlightedCode,
  messageBoxRef,
  handleScroll
}) => {
  return (
    <div
      ref={messageBoxRef}
      onScroll={handleScroll}
      className="flex flex-col flex-grow gap-1 p-1 pb-20 overflow-auto pt-14 message-box scrollbar-hide bg-slate-50 dark:bg-gray-800"
    >
      {Object.keys(groupedMessages)
        .sort((a, b) => a.localeCompare(b))
        .map((groupLabel) => (
          <div key={groupLabel}>
            <div className="py-2 text-sm text-center text-gray-500 dark:text-gray-400">{groupLabel}</div>
            {groupedMessages[groupLabel].map((msg, idx) => (
              <ErrorBoundary key={msg._id ? `${groupLabel}-${msg._id}` : `${groupLabel}-idx-${idx}`} fallbackMessage="Error rendering message">
                <ChatMessage
                  msg={msg}
                  user={user}
                  messages={messages}
                  project={project}
                  isDarkMode={isDarkMode}
                  bubbleRoundnessClass={bubbleRoundnessClass}
                  messageFontSizeClass={messageFontSizeClass}
                  getUserBubbleStyle={getUserBubbleStyle}
                  toggleEmojiPicker={toggleEmojiPicker}
                  messageEmojiPickers={messageEmojiPickers}
                  handleReaction={handleReaction}
                  setReplyingTo={setReplyingTo}
                  expandedReplies={expandedReplies}
                  setExpandedReplies={setExpandedReplies}
                  settings={settings}
                  getMessageStatus={getMessageStatus}
                  SyntaxHighlightedCode={SyntaxHighlightedCode}
                />
              </ErrorBoundary>
            ))}
          </div>
        ))}
    </div>
  );
};

MessageList.propTypes = {
  groupedMessages: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  bubbleRoundnessClass: PropTypes.string.isRequired,
  messageFontSizeClass: PropTypes.string.isRequired,
  getUserBubbleStyle: PropTypes.func.isRequired,
  toggleEmojiPicker: PropTypes.func.isRequired,
  messageEmojiPickers: PropTypes.object.isRequired,
  handleReaction: PropTypes.func.isRequired,
  setReplyingTo: PropTypes.func.isRequired,
  expandedReplies: PropTypes.object.isRequired,
  setExpandedReplies: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  getMessageStatus: PropTypes.func.isRequired,
  SyntaxHighlightedCode: PropTypes.elementType.isRequired,
  messageBoxRef: PropTypes.object.isRequired,
  handleScroll: PropTypes.func.isRequired,
};

export default React.memo(MessageList);
