/**
 * Utility for consistent API responses.
 */

export const success = (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const error = (res, message = 'Internal Server Error', status = 500, details = null) => {
    return res.status(status).json({
        success: false,
        error: message,
        details
    });
};

export default {
    success,
    error
};
