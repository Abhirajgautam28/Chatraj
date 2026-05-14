import { logger } from './logger.js';

export function logSanitizeError(err, req, scope) {
  logger.warn('mongoSanitize failed', {
    err: err && err.message ? err.message : err,
    method: req && req.method,
    url: req && req.originalUrl,
    scope,
  });
}

export default logSanitizeError;
