import PropTypes from 'prop-types';
import { Avatar as MuiAvatar } from '@mui/material';

const Avatar = ({ firstName = "", sx = {} }) => {
  const getInitials = () => {
    if (firstName) return firstName[0].toUpperCase();
    return "?";
  };
  return (
    <MuiAvatar sx={{ ...sx, bgcolor: 'primary.main' }}>
      {getInitials()}
    </MuiAvatar>
  );
};

Avatar.propTypes = {
  firstName: PropTypes.string,
  sx: PropTypes.object
};

export default Avatar;