import express from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 subscription requests per windowMs
});

// POST /api/newsletter/subscribe
router.post('/subscribe', newsletterLimiter, subscribeNewsletter);

export default router;
