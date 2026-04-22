import { validationResult } from 'express-validator';
import * as responseUtils from '../utils/response.js';

/**
 * Middleware to handle express-validator errors.
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return responseUtils.error(res, 'Validation failed', 400, errors.array());
    }
    next();
};

export default validate;
