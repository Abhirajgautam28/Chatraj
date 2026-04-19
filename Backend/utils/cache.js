import redisClient from '../services/redis.service.js';

export const withCache = async (key, ttl, fetchFn) => {
    try {
        const cached = await redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        console.error(`Cache read error for key ${key}:`, err);
    }

    const data = await fetchFn();

    try {
        await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (err) {
        console.error(`Cache write error for key ${key}:`, err);
    }

    return data;
};

export const invalidateCache = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`Cache invalidation error for key ${key}:`, err);
    }
};
