import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl text-white animate-bounce-in ${bgColors[type] || bgColors.info}`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <i className="ri-close-line text-lg"></i>
      </button>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-in {
          0% { transform: translate(-50%, 100%); opacity: 0; }
          60% { transform: translate(-50%, -10%); opacity: 1; }
          100% { transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Toast;
