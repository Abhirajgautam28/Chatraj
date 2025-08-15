import React from 'react';
import MuiAvatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';

const Avatar = ({ firstName = "", ...props }) => {
  return (
    <MuiAvatar {...props}>
      {firstName ? firstName[0].toUpperCase() : '?'}
    </MuiAvatar>
  );
};

Avatar.propTypes = {
  firstName: PropTypes.string,
};

export default Avatar;