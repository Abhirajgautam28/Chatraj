import React from 'react';
import { useState } from 'react';
import axios from '../config/axios';

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        setIsError(false);
        try {
            await axios.post('/api/contact/submit', { name, email, message });
            setStatus('Message sent successfully!');
            setName('');
            setEmail('');
            setMessage('');
            setTimeout(() => setStatus(''), 5000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to send message. Please try again.';
            setStatus(errorMsg);
            setIsError(true);
        }
    };

    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">Contact Us</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Get in touch</h3>
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            Have a question or want to work with us? Fill out the form and we&apos;ll get back to you as soon as possible.
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                            <i className="text-2xl text-blue-600 ri-map-pin-line"></i>
                            <p className="text-gray-600 dark:text-gray-300">Bengaluru, India.</p>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <i className="text-2xl text-blue-600 ri-mail-line"></i>
                            <p className="text-gray-600 dark:text-gray-300">Abhirajgautam28@gmail.com</p>
                        </div>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg dark:text-white dark:bg-gray-800 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg dark:text-white dark:bg-gray-800 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-800 dark:text-white">Message</label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="4"
                                    className="w-full p-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg dark:text-white dark:bg-gray-800 dark:border-gray-600"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'Sending...'}
                                className={`w-full p-3 text-white transition-colors rounded-lg ${
                                    status === 'Sending...' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {status === 'Sending...' ? 'Sending...' : 'Send Message'}
                            </button>
                            {status && status !== 'Sending...' && (
                                <p className={`mt-2 text-center text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
                                    {status}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
