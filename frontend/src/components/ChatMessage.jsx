import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';

const ChatMessage = React.memo(({
    msg,
    user,
    isDarkMode,
    bubbleRoundnessClass,
    messageFontSizeClass,
    getUserBubbleStyle,
    settings,
    messages,
    users,
    project,
    expandedReplies,
    setExpandedReplies,
    toggleEmojiPicker,
    messageEmojiPickers,
    handleReaction,
    setReplyingTo,
    SyntaxHighlightedCode,
    getMessageStatus
}) => {
    const isCurrentUser =
        msg.sender &&
        typeof msg.sender === "object" &&
        msg.sender._id &&
        msg.sender._id.toString() === user._id.toString()

    const parentMsg = msg.parentMessageId && messages.find((m) => m._id === msg.parentMessageId)

    let reactionGroups = {};
    if (msg.reactions) {
        msg.reactions.forEach(r => {
            if (!reactionGroups[r.emoji]) {
                reactionGroups[r.emoji] = [];
            }
            if (!reactionGroups[r.emoji].includes(r.userId)) {
                reactionGroups[r.emoji].push(r.userId);
            }
        });
    }

    const isSystemMsg = (msg.type === 'system') || (typeof msg.message === 'string' && (
        /^user (joined|left|removed|added|invited|renamed|deleted|updated)/i.test(msg.message) ||
        /^file (created|updated|deleted|renamed)/i.test(msg.message) ||
        /^system:/i.test(msg.message)
    ));

    if (isSystemMsg) {
        if (!settings.behavior.showSystemMessages) return null;
        let notificationText = msg.message;
        if (/^User joined the project/i.test(msg.message) && msg.sender && msg.sender._id && msg.sender._id !== 'system') {
            const joinedUser = users.find(u => u._id === msg.sender._id);
            if (joinedUser) {
                notificationText = `${joinedUser.firstName}${joinedUser.lastName ? ' ' + joinedUser.lastName : ''} joined the project`;
            }
        }
        return (
            <div className="flex justify-center my-2">
                <div className="px-4 py-2 text-sm font-semibold text-blue-900 bg-blue-100 rounded shadow dark:bg-blue-900 dark:text-blue-100">
                    {notificationText}
                </div>
            </div>
        );
    }

    const isReply = !!msg.parentMessageId;
    const isReplyCollapsed = settings.behavior.collapseReplies && isReply && !expandedReplies[msg._id];

    return (
        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} mb-2`}>
            {isReply && !isReplyCollapsed && (
                <div className="px-2 py-1 mb-1 text-xs italic bg-gray-200 rounded">
                    Replying to: {parentMsg ? (typeof parentMsg.sender === "object" ? parentMsg.sender.firstName : parentMsg.sender) : "Unknown"}
                </div>
            )}
            {isReply && isReplyCollapsed && (
                <button
                    className="px-2 py-1 mb-1 text-xs italic bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setExpandedReplies(prev => ({ ...prev, [msg._id]: true }))}
                >
                    Show Reply
                </button>
            )}
            <div className="flex items-start gap-2">
                {!isCurrentUser && settings.display?.showAvatars && msg.sender && (
                    <Avatar firstName={msg.sender.firstName} className="w-8 h-8" />
                )}
                <div
                    className={`flex flex-col p-2 max-w-xs break-words ${bubbleRoundnessClass} ${messageFontSizeClass} ${isCurrentUser ? "" : "bg-white text-gray-800 shadow"}`}
                    style={isCurrentUser ? getUserBubbleStyle() : {}}
                >
                    {!isCurrentUser && (
                        <small className={`mb-1 font-bold text-gray-700 ${messageFontSizeClass}`}>
                            {typeof msg.sender === "object" ? msg.sender.firstName : msg.sender}
                        </small>
                    )}
                    <div className={`whitespace-pre-wrap ${messageFontSizeClass}`}>
                        {msg.sender && msg.sender._id === "Chatraj" ? (
                            <div className={`p-2 rounded ${settings.display.syntaxHighlighting === false
                                ? (isDarkMode ? "bg-gray-900 text-white" : "bg-slate-200 text-black")
                                : "text-white bg-slate-950"} ${messageFontSizeClass}`}>
                                <Markdown options={{
                                    overrides: {
                                        code: settings.display.syntaxHighlighting === false
                                            ? {
                                                component: (props) => <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', display: 'block', background: 'none', color: 'inherit' }}>{props.children}</code>
                                            }
                                            : SyntaxHighlightedCode
                                    }
                                }}>
                                    {(() => {
                                        try {
                                            const parsedMessage = JSON.parse(msg.message);
                                            return parsedMessage.text || msg.message;
                                        } catch {
                                            return msg.message;
                                        }
                                    })()}
                                </Markdown>
                            </div>
                        ) : (
                            <p className={messageFontSizeClass}>{msg.message}</p>
                        )}
                    </div>
                </div>
                {isCurrentUser && (
                    <Avatar
                        firstName={user.firstName}
                        className="w-8 h-8 text-sm"
                        style={getUserBubbleStyle()}
                    />
                )}
            </div>
            <div className="relative group">
                <div className="flex items-center gap-2 mt-1">
                    {settings.display?.showTimestamps && (
                        <small className="text-[10px] text-gray-600">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </small>
                    )}
                    {settings.behavior.showReadReceipts && isCurrentUser && (
                        (() => {
                            const status = getMessageStatus(msg);
                            if (!status) return null;
                            return (
                                <span className="flex items-center gap-1 ml-2 text-xs" style={{ color: status.icon === 'double-green' ? '#22c55e' : status.icon === 'double' ? '#555' : '#555' }}>
                                    {status.icon === 'single' && (
                                        <i className="ri-check-line" title="Sent"></i>
                                    )}
                                    {status.icon === 'double' && (
                                        <i className="ri-check-double-line" title="Received"></i>
                                    )}
                                    {status.icon === 'double-green' && (
                                        <i className="ri-check-double-line" style={{ color: '#22c55e' }} title="Seen"></i>
                                    )}
                                    <span>{status.label}</span>
                                </span>
                            );
                        })()
                    )}
                    <div className="relative">
                        {!isCurrentUser && (
                            <button
                                className="p-1 text-xs text-gray-600 rounded opacity-0 dark:text-gray-400 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => toggleEmojiPicker(msg._id)}
                            >
                                <i className="text-base ri-emotion-line"></i>
                            </button>
                        )}
                        <EmojiPicker
                            isOpen={messageEmojiPickers[msg._id]}
                            setIsOpen={(isOpen) => {
                                toggleEmojiPicker(msg._id, isOpen);
                            }}
                            isCurrentUser={isCurrentUser}
                            onSelect={(emoji) => {
                                if (msg._id && !isCurrentUser) {
                                    handleReaction(msg._id, emoji, user._id);
                                }
                            }}
                        />
                    </div>
                    {Object.entries(reactionGroups).map(([emoji, rUsers]) => {
                        if (rUsers.length === 0) return null;
                        return (
                            <button
                                key={emoji}
                                className={`text-xs px-2 py-1 rounded-full ${rUsers.includes(user._id)
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                    }`}
                                title={rUsers.map(userId => {
                                    const reactingUser = project.users.find(u => u._id === userId);
                                    return reactingUser ? reactingUser.firstName : 'Unknown';
                                }).join(', ')}
                            >
                                {emoji} {rUsers.length}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                        Reply
                    </button>
                </div>
            </div>
        </div>
    );
});

ChatMessage.displayName = 'ChatMessage';

ChatMessage.propTypes = {
    msg: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    bubbleRoundnessClass: PropTypes.string,
    messageFontSizeClass: PropTypes.string,
    getUserBubbleStyle: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired,
    project: PropTypes.object.isRequired,
    expandedReplies: PropTypes.object.isRequired,
    setExpandedReplies: PropTypes.func.isRequired,
    toggleEmojiPicker: PropTypes.func.isRequired,
    messageEmojiPickers: PropTypes.object.isRequired,
    handleReaction: PropTypes.func.isRequired,
    setReplyingTo: PropTypes.func.isRequired,
    SyntaxHighlightedCode: PropTypes.func.isRequired,
    getMessageStatus: PropTypes.func.isRequired
};

export default ChatMessage;
