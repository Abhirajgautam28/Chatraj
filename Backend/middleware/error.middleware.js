import logger from '../utils/logger.js';

/**
 * Centralized error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(err.stack);
  }

  // Handle CSRF errors
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden'
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Handle Unauthorized errors from services
  if (err.message === 'Unauthorized access' || err.message === 'Unauthorized User') {
    return res.status(401).json({ error: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.stack : 'Internal Server Error'
  });
};

export default errorHandler;
