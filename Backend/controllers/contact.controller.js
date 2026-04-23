import { successResponse, errorResponse } from "../utils/response.utils.js";
import Contact from '../models/contact.model.js';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

export const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(res, "Validation failed", 400, errors.array());
    }

    try {
        const { name, email, message } = req.body;
        const newContact = await Contact.create({ name, email, message });

        logger.info(`New contact form submission from ${email}`);

        return successResponse(res, {
            message: 'Your message has been sent successfully. We will get back to you soon.',
            contact: newContact
        }, 'Submission successful', 201);
    } catch (error) {
        logger.error('submitContactForm error:', error);
        return errorResponse(res, "Internal server error", 500);
    }
};
