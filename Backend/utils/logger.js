const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (...args) => {
        if (!isProduction) {
            console.info('[INFO]', ...args);
        }
    },
    error: (...args) => {
        // Errors are always logged, but can be enhanced here
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
