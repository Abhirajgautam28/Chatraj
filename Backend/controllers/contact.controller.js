import Contact from '../models/contact.model.js';
import { validationResult } from 'express-validator';
import * as responseUtils from '../utils/response.js';

export const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        return responseUtils.sendSuccess(res, { message: 'Contact form submitted successfully' }, 201);
    } catch (error) {
        return responseUtils.sendError(res, 'Internal Server Error', 500, error.message);
    }
};

export const getContactSubmissions = async (req, res) => {
    try {
        const submissions = await Contact.find().sort({ createdAt: -1 });
        return responseUtils.sendSuccess(res, { submissions });
    } catch (error) {
        return responseUtils.sendError(res, 'Internal Server Error', 500, error.message);
    }
};
