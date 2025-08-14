import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import 'animate.css';

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Always clear token and user, then redirect to home page
    localStorage.removeItem('token');
    setUser(null);
  axios.get('/api/users/logout').catch(() => {});
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, setUser]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <div
          className="p-8 text-center"
        >
          <div
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute w-full h-full border-4 border-blue-500 rounded-full opacity-20"></div>
            <div className="absolute w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>

          <h2
            className="mb-6 text-3xl font-bold text-white"
          >
            Logging Out...
          </h2>

          <p
            className="text-lg text-gray-300"
          >
            Thank you for using ChatRaj
          </p>

          <div
            className="mt-8 text-gray-400"
          >
            <p>Redirecting to login page...</p>
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    animation: `pulse 1s infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;