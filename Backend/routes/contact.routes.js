import { Router } from 'express';
import { body } from 'express-validator';
import * as contactController from '../controllers/contact.controller.js';

const router = Router();

router.post('/submit',
    [
        body('name').notEmpty().withMessage('Name is required').trim(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('message').notEmpty().withMessage('Message is required').trim()
    ],
    contactController.submitContactForm
);

export default router;
