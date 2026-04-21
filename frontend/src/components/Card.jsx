import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ className = '', children, ...rest }) => (
  <div
    className={`p-6 rounded-lg shadow-md bg-white dark:bg-card-dark-mode-gradient ${className}`}
    {...rest}
  >
    {children}
  </div>
);

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
