import * as newsletterService from '../services/newsletter.service.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await newsletterService.subscribe(email);
    res.status(201).json({ message: 'Subscribed successfully!', ...result });
  } catch (err) {
    const status = err.message === 'Email already subscribed' ? 409 : (err.message === 'Valid email is required' ? 400 : 500);
    res.status(status).json({ error: err.message || 'Server error.' });
  }
};
