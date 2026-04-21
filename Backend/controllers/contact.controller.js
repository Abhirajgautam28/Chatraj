import Contact from '../models/contact.model.js';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

export const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, message } = req.body;
        const newContact = await Contact.create({ name, email, message });

        logger.info(`New contact form submission from ${email}`);

        res.status(201).json({
            message: 'Your message has been sent successfully. We will get back to you soon.',
            contact: newContact
        });
    } catch (error) {
        logger.error('submitContactForm error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
