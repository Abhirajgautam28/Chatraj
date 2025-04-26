import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'animate.css';

const WelcomeChatRaj = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/chat');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-800 to-gray-900">
      <div className="w-full max-w-4xl p-8 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold animate__animated animate__fadeInDown">
          👋 Hello, I'm ChatRaj!
        </h1>
        <p className="text-xl animate__animated animate__fadeIn">
          Your friendly AI assistant
        </p>
      </div>
    </div>
  );
};

export default WelcomeChatRaj;