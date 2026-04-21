import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';

const ChatMessage = ({
  msg, user, isDarkMode, settings, onReply, onReaction,
  messageFontSizeClass, bubbleRoundnessClass, getUserBubbleStyle,
  SyntaxHighlightedCode, toggleEmojiPicker, isEmojiPickerOpen, getMessageStatus
}) => {
    const isCurrentUser = msg.sender && msg.sender._id === user._id;

    let reactionGroups = {};
    if (msg.reactions) {
      msg.reactions.forEach(r => {
        if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
        if (!reactionGroups[r.emoji].includes(r.userId)) reactionGroups[r.emoji].push(r.userId);
      });
    }

    const renderText = () => {
        try {
            const parsed = JSON.parse(msg.message);
            return parsed.text || msg.message;
        } catch { return msg.message; }
    };

    return (
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}>
        <div className="flex items-start gap-2">
          {!isCurrentUser && settings.display?.showAvatars && msg.sender && <Avatar firstName={msg.sender.firstName} className="w-8 h-8" />}
          <div className={`flex flex-col p-2 max-w-xs break-words ${bubbleRoundnessClass} ${messageFontSizeClass} ${isCurrentUser ? "" : "bg-white text-gray-800 shadow"}`} style={isCurrentUser ? getUserBubbleStyle() : {}}>
            {!isCurrentUser && <small className={`mb-1 font-bold text-gray-700 ${messageFontSizeClass}`}>{typeof msg.sender === "object" ? msg.sender.firstName : msg.sender}</small>}
            <div className={`whitespace-pre-wrap ${messageFontSizeClass}`}>
              {msg.sender && msg.sender._id === "Chatraj" ? (
                <div className={`p-2 rounded ${settings.display.syntaxHighlighting === false ? (isDarkMode ? "bg-gray-900 text-white" : "bg-slate-200 text-black") : "text-white bg-slate-950"} ${messageFontSizeClass}`}>
                  <Markdown options={{ overrides: { code: settings.display.syntaxHighlighting === false ? { component: (props) => <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block' }}>{props.children}</code> } : SyntaxHighlightedCode } }}>{renderText()}</Markdown>
                </div>
              ) : <p className={messageFontSizeClass}>{msg.message}</p>}
            </div>
          </div>
          {isCurrentUser && <Avatar firstName={user.firstName} className="w-8 h-8 text-sm" style={getUserBubbleStyle()} />}
        </div>
        <div className="flex items-center gap-2 mt-1">
            {settings.display?.showTimestamps && <small className="text-[10px] text-gray-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>}
            {isCurrentUser && settings.behavior.showReadReceipts && <span className="text-xs">{getMessageStatus(msg)?.label}</span>}
            {!isCurrentUser && <button onClick={() => toggleEmojiPicker(msg._id)} className="p-1 opacity-0 hover:opacity-100"><i className="ri-emotion-line"></i></button>}
            <EmojiPicker isOpen={isEmojiPickerOpen} onSelect={(emoji) => onReaction(msg._id, emoji, user._id)} />
            <button onClick={() => onReply(msg)} className="text-xs opacity-0 hover:opacity-100">Reply</button>
        </div>
      </div>
    );
};

ChatMessage.propTypes = {
    msg: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    isDarkMode: PropTypes.bool,
    settings: PropTypes.object,
    onReply: PropTypes.func,
    onReaction: PropTypes.func,
    messageFontSizeClass: PropTypes.string,
    bubbleRoundnessClass: PropTypes.string,
    getUserBubbleStyle: PropTypes.func,
    SyntaxHighlightedCode: PropTypes.func,
    toggleEmojiPicker: PropTypes.func,
    isEmojiPickerOpen: PropTypes.bool,
    getMessageStatus: PropTypes.func
};

export default ChatMessage;
