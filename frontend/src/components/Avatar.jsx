const Avatar = ({ email = "", className = "" }) => {
  const getInitials = (email) => {
    if (!email) return ""
    
    return email
      .split('@')[0]
      .split(/[-._]/)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(email);
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-red-500', 'bg-purple-500', 'bg-pink-500'
  ];
  
  const colorIndex = email ? email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;

  return (
    <div className={`flex items-center justify-center rounded-full ${colors[colorIndex]} ${className}`}>
      <span className="font-medium text-white">{initials || "?"}</span>
    </div>
  );
};

export default Avatar;