import * as newsletterService from '../services/newsletter.service.js';
import response from '../utils/response.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await newsletterService.subscribe(email);
    return response.success(res, result, 'Subscribed successfully!', 201);
  } catch (err) {
    const status = err.message === 'Email already subscribed' ? 409 : (err.message === 'Valid email is required' ? 400 : 500);
    return response.error(res, err.message, status);
  }
};
