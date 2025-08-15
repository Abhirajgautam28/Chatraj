import PropTypes from 'prop-types';
import { Popper, Paper, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';

const EmojiPicker = ({ onSelect, isOpen, setIsOpen, anchorEl }) => {
  const emojis = ['👍', '❤️', '😂', '🎉', '🚀', '💯', '👀', '🔥'];

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popper open={isOpen} anchorEl={anchorEl} placement="top" sx={{ zIndex: 1300 }}>
      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
        {emojis.map(emoji => (
          <IconButton
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            size="small"
          >
            {emoji}
          </IconButton>
        ))}
        <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ ml: 1 }}>
            <Close fontSize="small" />
        </IconButton>
      </Paper>
    </Popper>
  );
};

EmojiPicker.propTypes = {
    onSelect: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
};

export default EmojiPicker;