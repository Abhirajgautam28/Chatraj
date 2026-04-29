import React from 'react';

const LoadingScreen = () => {
  return (
    <div
      className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading ChatRaj...</span>
    </div>
  );
};

export default LoadingScreen;
