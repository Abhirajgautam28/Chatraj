/**
 * Centralized logger utility for consistent logging across the backend.
 * In a real-world app, this could be replaced with Winston or Bunyan.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (...args) => {
        console.log(`[INFO] ${new Date().toISOString()}:`, ...args);
    },
    error: (...args) => {
        console.error(`[ERROR] ${new Date().toISOString()}:`, ...args);
    },
    warn: (...args) => {
        console.warn(`[WARN] ${new Date().toISOString()}:`, ...args);
    },
    debug: (...args) => {
        if (!isProduction) {
            console.debug(`[DEBUG] ${new Date().toISOString()}:`, ...args);
        }
    }
};

export default logger;
