import redisClient from '../services/redis.service.js';
import { logger } from './logger.js';

/**
 * Executes a function with caching in Redis.
 * @param {string} key - Redis key for caching.
 * @param {number} ttl - Time to live in seconds.
 * @param {function} fn - Function to execute if cache miss occurs.
 * @returns {any} - Data from cache or function execution.
 */
export const withCache = async (key, ttl, fn) => {
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        logger.warn('Redis read error in withCache:', err.message);
    }

    const data = await fn();

    if (data !== null && data !== undefined) {
        try {
            await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
        } catch (err) {
            logger.warn('Redis write error in withCache:', err.message);
        }
    }

    return data;
};

/**
 * Invalidates a Redis cache key.
 * @param {string} key - Redis key to invalidate.
 */
export const invalidateCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        logger.warn('Redis delete error in invalidateCache:', err.message);
    }
};
