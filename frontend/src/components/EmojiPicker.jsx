import React from 'react';
import { Popover, Box, IconButton } from '@mui/material';
import PropTypes from 'prop-types';

const EmojiPicker = ({ onSelect, isOpen, setIsOpen, anchorEl }) => {
  const emojis = ['👍', '❤️', '😂', '🎉', '🚀', '💯', '👀', '🔥'];

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={() => setIsOpen(false)}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <Box sx={{ display: 'flex', p: 1 }}>
        {emojis.map((emoji) => (
          <IconButton key={emoji} onClick={() => handleEmojiClick(emoji)} size="small">
            {emoji}
          </IconButton>
        ))}
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