import React from 'react';
import { useState } from 'react';
import axios from '../config/axios';

const NewsletterSubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | duplicate
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await axios.post('/api/newsletter/subscribe', { email });
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
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xl gap-4 mx-auto md:flex-row md:justify-center">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full max-w-xs px-4 py-3 text-lg text-gray-900 bg-white border border-blue-200 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={status === 'loading' || status === 'success'}
      />
      <button
        type="submit"
        className="px-8 py-3 text-lg font-medium text-white transition-all bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-60"
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
      </button>
      {status === 'success' && (
        <span className="block mt-2 text-green-400">Thank you for subscribing!</span>
      )}
      {status === 'duplicate' && (
        <span className="block mt-2 text-yellow-400">You are already subscribed.</span>
      )}
      {status === 'error' && (
        <span className="block mt-2 text-red-400">{error}</span>
      )}
    </form>
  );
};

export default NewsletterSubscribeForm;
