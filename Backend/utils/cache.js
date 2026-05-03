import redisClient from '../services/redis.service.js';
import { logger } from './logger.js';

export const withCache = async (key, ttl, fetchFn) => {
    try {
        const cached = await redisClient.get(key);
        if (cached) return JSON.parse(cached);

        const fresh = await fetchFn();
        await redisClient.set(key, JSON.stringify(fresh), 'EX', ttl);
        return fresh;
    } catch (err) {
        logger.error(`Cache error for ${key}:`, err);
        return fetchFn();
    }
};

export const invalidateCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        logger.error(`Invalidate cache error for ${key}:`, err);
    }
};
