import React from 'react';

const Card = ({ className = '', children }) => (
  <div className={`p-6 rounded-lg shadow-md bg-white dark:bg-card-dark-mode-gradient ${className}`}>
    {children}
  </div>
);

export default Card;
