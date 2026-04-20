/**
 * Standardizes API responses and optimizes payload size for transmission.
 * Shorter keys and flattened structures lead to better compression ratios.
 */

export const successResponse = (res, data, status = 200) => {
    return res.status(status).json(data);
};

export const errorResponse = (res, message, status = 500, details = null) => {
    const response = { error: message };
    if (details) response.details = details;
    return res.status(status).json(response);
};
