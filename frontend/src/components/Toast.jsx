import React from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type, onClose, duration }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgClass = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    }[type] || 'bg-gray-800';

    return (
        <div className={`${bgClass} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in pointer-events-auto min-w-[300px]`}>
            <div className="flex-grow font-medium">{message}</div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <i className="ri-close-line text-lg"></i>
            </button>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number.isRequired
};

export default Toast;
