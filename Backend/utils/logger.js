export const logger = {
    info: (...args) => {
        console.info('[INFO]', ...args);
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },
    debug: (...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[DEBUG]', ...args);
        }
    }
};
