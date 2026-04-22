import logger from '../utils/logger.js';
import response from '../utils/response.js';

/**
 * Centralized error handling middleware.
 * Provides specialized handling for common application errors and standardizes the output.
 */
export const errorHandler = (err, req, res, next) => {
  // Prevent sending multiple responses if headers are already sent
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV === 'development';

  if (process.env.NODE_ENV !== 'test') {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
  }

  // 1. Handle CSRF errors
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    return response.error(res, 'Security Check Failed: Invalid CSRF token', 403, {
        code: 'CSRF_INVALID',
        details: isDev ? err.message : 'Forbidden'
    });
  }

  // 2. Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
    }));
    return response.error(res, 'Validation Error', 400, {
        code: 'VALIDATION_FAILED',
        details
    });
  }

  // 3. Handle Mongoose Cast Errors (Invalid IDs)
  if (err.name === 'CastError') {
    return response.error(res, `Invalid format for field: ${err.path}`, 400, {
        code: 'INVALID_FORMAT',
        value: err.value
    });
  }

  // 4. Handle MongoDB Duplicate Key Errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return response.error(res, `${field} already exists`, 409, {
        code: 'DUPLICATE_KEY',
        field
    });
  }

  // 5. Handle JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return response.error(res, 'Authentication Failed: Invalid token', 401, { code: 'JWT_INVALID' });
  }
  if (err.name === 'TokenExpiredError') {
    return response.error(res, 'Authentication Failed: Token expired', 401, { code: 'JWT_EXPIRED' });
  }

  // 6. Handle Known Service Layer Errors
  const serviceErrors = {
      'Unauthorized access': { status: 401, code: 'UNAUTHORIZED' },
      'Unauthorized User': { status: 401, code: 'UNAUTHORIZED' },
      'User not found': { status: 404, code: 'NOT_FOUND' },
      'Project not found': { status: 404, code: 'NOT_FOUND' },
      'Invalid credentials': { status: 401, code: 'INVALID_CREDENTIALS' },
      'Account not verified': { status: 403, code: 'ACCOUNT_UNVERIFIED' }
  };

  if (serviceErrors[err.message]) {
      const { status, code } = serviceErrors[err.message];
      return response.error(res, err.message, status, { code });
  }

  // 7. Default Internal Server Error
  const status = err.status || 500;
  return response.error(
    res,
    err.message || 'An unexpected error occurred',
    status,
    {
        code: 'INTERNAL_SERVER_ERROR',
        stack: isDev ? err.stack : undefined
    }
  );
};

export default errorHandler;
