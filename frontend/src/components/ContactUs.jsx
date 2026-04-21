import React, { useState } from 'react';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';
import { logger } from '../utils/logger';

const ContactUs = () => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !message) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/contact/submit', { name, email, message });
            showToast(response.data.message || 'Message sent successfully!', 'success');
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            logger.error('ContactUs submission error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to send message. Please try again.';
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-transparent relative z-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a question about ChatRaj or want to discuss a collaboration? Our team is here to help you.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <i className="ri-mail-line text-2xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Email us at</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">abhirajgautam28@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <i className="ri-map-pin-line text-2xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Our location</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">Bengaluru, India</p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Follow us</p>
                                    <div className="flex gap-4">
                                        {['twitter-x', 'github', 'linkedin', 'discord'].map(platform => (
                                            <a key={platform} href="#" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-all">
                                                <i className={`ri-${platform}-line text-xl`}></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-800 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                        placeholder="John Doe"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                        placeholder="john@example.com"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white resize-none"
                                    placeholder="How can we help you?"
                                    required
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-send-plane-fill"></i>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
