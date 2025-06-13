import PropTypes from 'prop-types';

const Avatar = ({ firstName = "", className = "" }) => {
  const getInitials = () => {
    if (firstName) return firstName[0].toUpperCase();
    return "?";
  };
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-500 text-white ${className}`}>
      {getInitials()}
    </div>
  );
};

Avatar.propTypes = {
  firstName: PropTypes.string,
  className: PropTypes.string
};

export default Avatar;