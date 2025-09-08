import React from 'react';

const Card = ({ className = '', children, ...rest }) => (
  <div
    className={`p-6 rounded-lg shadow-md bg-white dark:bg-card-dark-mode-gradient ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
