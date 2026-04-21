const isProduction = import.meta.env.PROD;

export const logger = {
  info: (...args) => {
    if (!isProduction) {
      console.info('[INFO]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  debug: (...args) => {
    if (!isProduction) {
      console.debug('[DEBUG]', ...args);
    }
  }
};
