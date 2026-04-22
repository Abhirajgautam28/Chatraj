import { Router } from 'express';
import * as contactController from '../controllers/contact.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/submit',
    body('name').isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters long'),
    contactController.submitContactForm
);

router.get('/submissions', authMiddleware.authUser, contactController.getContactSubmissions);

export default router;
