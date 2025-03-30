const EmojiPicker = ({ onSelect, isOpen, setIsOpen, isCurrentUser = false }) => {
  const emojis = ['👍', '❤️', '😂', '🎉', '🚀', '💯', '👀', '🔥'];
  
  if (!isOpen) return null;

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div 
      className={`absolute z-20 flex items-center px-3 py-1 rounded-full shadow-md ${
        isCurrentUser ? 'right-2' : 'left-2'
      } bottom-full mb-2 bg-gradient-to-r from-blue-500 to-purple-500`}
    >
      <i className="text-xs text-white ri-emotion-line" />
      <div className="flex gap-1 mx-2">
        {emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="p-1 text-sm transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
      <button
        className="ml-1 focus:outline-none"
        onClick={() => setIsOpen(false)}
      >
        <i className="text-xs text-white ri-close-line"></i>
      </button>
    </div>
  );
};

export default EmojiPicker;