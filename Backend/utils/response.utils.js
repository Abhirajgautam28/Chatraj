/**
 * Consistent API response structures for the backend.
 * Designed to be strictly backward compatible with the existing frontend
 * by spreading data and using 'message' for errors when appropriate.
 */

/**
 * Sends a successful JSON response.
 * Adds a `success: true` field and spreads the data object.
 *
 * @param {Response} res - Express response object.
 * @param {number} status - HTTP status code.
 * @param {Object} data - Data object to be spread into the response.
 * @param {string} [message] - Optional success message.
 */
export const sendSuccess = (res, status, data = {}, message) => {
  res.status(status).json({
    success: true,
    ...data,
    ...(message ? { message } : {})
  });
};

/**
 * Sends an error JSON response.
 * Adds a `success: false` field.
 *
 * @param {Response} res - Express response object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Primary error message (backward compatible).
 * @param {any} [errors] - Optional detailed error object or array (e.g. from express-validator).
 */
export const sendError = (res, status, message, errors) => {
  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {})
  });
};
