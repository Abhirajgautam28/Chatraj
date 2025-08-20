import PropTypes from 'prop-types';
import { Popover, IconButton, Box } from '@mui/material';
import { InsertEmoticon, Close } from '@mui/icons-material';

const EmojiPicker = ({ onSelect, isOpen, setIsOpen, anchorEl }) => {
  const emojis = ['👍', '❤️', '😂', '🎉', '🚀', '💯', '👀', '🔥'];
  
  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
    >
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <InsertEmoticon sx={{ mr: 1 }} />
            {emojis.map(emoji => (
                <IconButton
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    size="small"
                >
                    {emoji}
                </IconButton>
            ))}
            <IconButton onClick={() => setIsOpen(false)} size="small">
                <Close />
            </IconButton>
        </Box>
    </Popover>
  );
};

EmojiPicker.propTypes = {
    onSelect: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
};

export default EmojiPicker;