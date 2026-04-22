import express from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', newsletterLimiter, subscribeNewsletter);

export default router;
