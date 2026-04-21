import React from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

const CommentSection = ({ comments, newComment, setNewComment, onCommentSubmit, isDarkMode }) => {
    return (
        <div className="mt-12 space-y-8">
            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Comments ({comments.length})
            </h3>

            <div className="flex gap-4">
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the discussion..."
                        className={`w-full p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none`}
                        rows="3"
                    />
                    <button
                        onClick={onCommentSubmit}
                        disabled={!newComment.trim()}
                        className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
                    >
                        Post Comment
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment, idx) => (
                        <div key={comment._id || idx} className={`flex gap-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <Avatar firstName={comment.user?.firstName || '?'} className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-blue-600 dark:text-blue-300">
                                        {comment.user?.firstName} {comment.user?.lastName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic py-8">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
};

CommentSection.propTypes = {
    comments: PropTypes.array.isRequired,
    newComment: PropTypes.string.isRequired,
    setNewComment: PropTypes.func.isRequired,
    onCommentSubmit: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
};

export default React.memo(CommentSection);
