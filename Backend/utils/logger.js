/**
 * Simple environment-aware logger for the backend.
 */
const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.info('[INFO]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

export default logger;
