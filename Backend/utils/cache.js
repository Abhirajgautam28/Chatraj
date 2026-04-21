import redisClient from '../services/redis.service.js';

/**
 * Executes the provided fetch function and caches the result in Redis.
 * Returns cached data if available.
 *
 * @param {string} key - Redis key.
 * @param {number} ttl - Time to live in seconds.
 * @param {Function} fetchFn - Async function to fetch fresh data.
 * @returns {Promise<any>}
 */
export const withCache = async (key, ttl, fetchFn) => {
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        // Fallback to fetch if Redis fails
        console.error(`Cache get error for key ${key}:`, err);
    }

    const freshData = await fetchFn();

    if (freshData !== undefined && freshData !== null) {
        try {
            await redisClient.set(key, JSON.stringify(freshData), 'EX', ttl);
        } catch (err) {
            console.error(`Cache set error for key ${key}:`, err);
        }
    }

    return freshData;
};

/**
 * Invalidates a specific cache key.
 * @param {string} key
 */
export const invalidateCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`Cache invalidate error for key ${key}:`, err);
    }
};

export default {
    withCache,
    invalidateCache
};
