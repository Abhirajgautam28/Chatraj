import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from '../config/axios';

const NewsletterSubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setError('');
    try {
      await axios.post('/api/newsletter/subscribe', { email: email.trim() });
      setStatus('success');
      setEmail('');
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus('duplicate');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
        setStatus('error');
      } else {
        setError('Something went wrong. Please try again.');
        setStatus('error');
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xl gap-4 mx-auto md:flex-row md:justify-center">
        <div className="relative w-full max-w-xs">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-6 py-4 text-gray-900 bg-white border-2 border-transparent rounded-full shadow-lg focus:outline-none focus:border-blue-500 transition-all"
            disabled={status === 'loading' || status === 'success'}
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 font-bold text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:hover:scale-100"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <div className="flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin"></i>
              Subscribing...
            </div>
          ) : status === 'success' ? (
            <div className="flex items-center gap-2">
              <i className="ri-checkbox-circle-line"></i>
              Subscribed
            </div>
          ) : 'Subscribe Now'}
        </button>
      </form>

      <div className="mt-4 h-6 text-center">
        {status === 'success' && (
          <span className="text-green-400 font-medium flex items-center justify-center gap-1">
            <i className="ri-heart-fill"></i> Thank you for joining our community!
          </span>
        )}
        {status === 'duplicate' && (
          <span className="text-yellow-400 font-medium">You&apos;re already on the list! Stay tuned.</span>
        )}
        {status === 'error' && (
          <span className="text-red-400 font-medium">{error}</span>
        )}
      </div>
    </div>
  );
};

NewsletterSubscribeForm.propTypes = {
  // Component takes no props currently
};

export default NewsletterSubscribeForm;
