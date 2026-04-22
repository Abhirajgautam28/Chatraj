import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';

const CodeBlockWithCopy = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = React.Children.toArray(children).join('');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group/code">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
        title="Copy code"
      >
        <i className={copied ? "ri-check-line text-green-400" : "ri-file-copy-line"}></i>
      </button>
      <code {...props}>{children}</code>
    </div>
  );
};

const HighlightedText = ({ text, searchTerm }) => {
    if (!searchTerm) return <>{text}</>;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase()
                    ? <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-black dark:text-white rounded-sm px-0.5">{part}</span>
                    : part
            )}
        </>
    );
};

const ChatMessage = React.memo(({
  msg,
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
  searchTerm
}) => {
  const isCurrentUser =
    msg.sender &&
    typeof msg.sender === "object" &&
    msg.sender._id &&
    msg.sender._id.toString() === user?._id?.toString();

  const parentMsg = msg.parentMessageId && messages.find((m) => m._id === msg.parentMessageId);

  let reactionGroups = {};
  if (msg.reactions) {
    msg.reactions.forEach(r => {
      if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
      if (!reactionGroups[r.emoji].includes(r.userId)) reactionGroups[r.emoji].push(r.userId);
    });
  }

  const isSystemMsg = (msg.type === 'system') || (typeof msg.message === 'string' && (
    /^user (joined|left|removed|added|invited|renamed|deleted|updated)/i.test(msg.message) ||
    /^file (created|updated|deleted|renamed)/i.test(msg.message) ||
    /^system:/i.test(msg.message)
  ));

  if (isSystemMsg) {
    if (!settings?.behavior?.showSystemMessages) return null;
    let notificationText = msg.message;
    if (/^User joined the project/i.test(msg.message) && msg.sender && msg.sender._id && msg.sender._id !== 'system') {
      const joinedUser = project.users?.find(u => u._id === msg.sender._id);
      if (joinedUser) notificationText = `${joinedUser.firstName}${joinedUser.lastName ? ' ' + joinedUser.lastName : ''} joined the project`;
    }
    return (
      <div key={msg._id} className="flex justify-center my-2">
        <div className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-100 rounded shadow dark:bg-blue-900 dark:text-blue-100">
          <HighlightedText text={notificationText} searchTerm={searchTerm} />
        </div>
      </div>
    );
  }

  const isReply = !!msg.parentMessageId;
  const isReplyCollapsed = settings?.behavior?.collapseReplies && isReply && !expandedReplies[msg._id];

  return (
    <div key={msg._id} className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}>
      {isReply && !isReplyCollapsed && (
        <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
          Replying to: {parentMsg ? (typeof parentMsg.sender === "object" ? parentMsg.sender.firstName : parentMsg.sender) : "Unknown"}
        </div>
      )}
      {isReply && isReplyCollapsed && (
        <button className="px-2 py-1 mb-1 text-xs italic bg-gray-100 rounded hover:bg-gray-200" onClick={() => setExpandedReplies(prev => ({ ...prev, [msg._id]: true }))}>Show Reply</button>
      )}
      <div className="flex items-start gap-2">
        {!isCurrentUser && settings?.display?.showAvatars && msg.sender && (
          <Avatar firstName={msg.sender.firstName} className="w-8 h-8" />
        )}
        <div className={`flex flex-col p-2 max-w-xs break-words ${bubbleRoundnessClass} ${messageFontSizeClass} ${isCurrentUser ? "" : "bg-white text-gray-800 shadow"}`} style={isCurrentUser ? getUserBubbleStyle() : {}}>
          {!isCurrentUser && (
            <small className={`mb-1 font-bold text-gray-700 ${messageFontSizeClass}`}>
              {typeof msg.sender === "object" ? msg.sender.firstName : msg.sender}
            </small>
          )}
          <div className={`whitespace-pre-wrap ${messageFontSizeClass}`}>
            {msg.sender && msg.sender._id === "Chatraj" ? (
              <div className={`p-2 rounded ${settings?.display?.syntaxHighlighting === false ? (isDarkMode ? "bg-gray-900 text-white" : "bg-slate-200 text-black") : "text-white bg-slate-950"} ${messageFontSizeClass}`}>
                <Markdown options={{
                  overrides: {
                    code: settings?.display?.syntaxHighlighting === false
                      ? { component: (props) => <CodeBlockWithCopy style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', display: 'block', background: 'none', color: 'inherit' }}>{props.children}</CodeBlockWithCopy> }
                      : { component: (props) => {
                          const Comp = SyntaxHighlightedCode;
                          return (
                            <div className="relative group/code">
                              <button onClick={() => navigator.clipboard.writeText(props.children)} className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white opacity-0 group-hover/code:opacity-100 transition-opacity z-20" title="Copy code"><i className="ri-file-copy-line"></i></button>
                              <Comp {...props} />
                            </div>
                          );
                        }
                      }
                  }
                }}>
                  {(() => {
                    try {
                      const parsed = JSON.parse(msg.message);
                      return parsed.text || msg.message;
                    } catch { return msg.message; }
                  })()}
                </Markdown>
              </div>
            ) : (
              <p className={messageFontSizeClass}><HighlightedText text={msg.message} searchTerm={searchTerm} /></p>
            )}
          </div>
        </div>
        {isCurrentUser && <Avatar firstName={user?.firstName} className="w-8 h-8 text-sm" style={getUserBubbleStyle()} />}
      </div>
      <div className="relative group">
        <div className="flex items-center gap-2 mt-1">
          {settings?.display?.showTimestamps && (
            <small className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
          )}
          {settings?.behavior?.showReadReceipts && isCurrentUser && (
            (() => {
              const status = getMessageStatus(msg);
              if (!status) return null;
              return (
                <span className="flex items-center gap-1 ml-2 text-xs" style={{ color: status.icon === 'double-green' ? '#22c55e' : '#555' }}>
                  <i className={`ri-check${status.icon.includes('double') ? '-double' : ''}-line`} title={status.label}></i>
                  <span>{status.label}</span>
                </span>
              );
            })()
          )}
          <div className="relative">
            {!isCurrentUser && <button className="p-1 text-xs text-gray-600 rounded opacity-0 dark:text-gray-400 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => toggleEmojiPicker(msg._id)}><i className="text-base ri-emotion-line"></i></button>}
            <EmojiPicker isOpen={messageEmojiPickers[msg._id]} setIsOpen={(isOpen) => toggleEmojiPicker(msg._id, isOpen)} isCurrentUser={isCurrentUser} onSelect={(emoji) => msg._id && !isCurrentUser && handleReaction(msg._id, emoji, user._id)} />
          </div>
          {Object.entries(reactionGroups).map(([emoji, users]) => users.length > 0 && (
              <button key={emoji} className={`text-xs px-2 py-1 rounded-full ${users.includes(user._id) ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`} title={users.map(uid => project.users?.find(u => u._id === uid)?.firstName || 'Unknown').join(', ')}>{emoji} {users.length}</button>
          ))}
          <button onClick={() => setReplyingTo(msg)} className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">Reply</button>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

ChatMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  user: PropTypes.object,
  messages: PropTypes.array,
  project: PropTypes.object,
  isDarkMode: PropTypes.bool,
  bubbleRoundnessClass: PropTypes.string,
  messageFontSizeClass: PropTypes.string,
  getUserBubbleStyle: PropTypes.func,
  toggleEmojiPicker: PropTypes.func,
  messageEmojiPickers: PropTypes.object,
  handleReaction: PropTypes.func,
  setReplyingTo: PropTypes.func,
  expandedReplies: PropTypes.object,
  setExpandedReplies: PropTypes.func,
  settings: PropTypes.object,
  getMessageStatus: PropTypes.func,
  SyntaxHighlightedCode: PropTypes.elementType,
  searchTerm: PropTypes.string
};

export default ChatMessage;
