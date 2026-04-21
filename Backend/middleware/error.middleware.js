import logger from '../utils/logger.js';
import response from '../utils/response.js';

/**
 * Centralized error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(err.stack);
  }

  // Handle CSRF errors
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    return response.error(res, 'Invalid CSRF token', 403, process.env.NODE_ENV === 'development' ? err.message : 'Forbidden');
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return response.error(res, 'Validation Error', 400, Object.values(err.errors).map(e => e.message));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return response.error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return response.error(res, 'Token expired', 401);
  }

  // Handle Unauthorized errors from services
  if (err.message === 'Unauthorized access' || err.message === 'Unauthorized User') {
    return response.error(res, err.message, 401);
  }

  const status = err.status || 500;
  return response.error(res, err.message || 'Something broke!', status, process.env.NODE_ENV === 'development' ? err.stack : 'Internal Server Error');
};

export default errorHandler;
