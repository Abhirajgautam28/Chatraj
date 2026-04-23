import redisClient from '../services/redis.service.js';

// Tiered Caching Utility: L1 (In-Memory) + L2 (Redis)
const L1_CACHE = new Map();
const L1_TTL = 30000; // 30 seconds for local memory

export const withCache = async (key, ttlSeconds, fetcher, tags = []) => {
    // 1. Check L1 Cache
    const cachedL1 = L1_CACHE.get(key);
    if (cachedL1 && Date.now() < cachedL1.expiry) {
        return cachedL1.data;
    }

    // 2. Check L2 Cache (Redis)
    try {
        const cachedL2 = await redisClient.get(key);
        if (cachedL2) {
            const data = JSON.parse(cachedL2);
            L1_CACHE.set(key, { data, expiry: Date.now() + L1_TTL });
            return data;
        }
    } catch (err) {
        console.warn('[PERF] Redis L2 cache read error:', err);
    }

    // 3. Fetch from Source
    const data = await fetcher();

    // 4. Update Caches
    L1_CACHE.set(key, { data, expiry: Date.now() + L1_TTL });
    try {
        await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);

        // Track tags for invalidation
        for (const tag of tags) {
            await redisClient.sadd(`tag:${tag}`, key);
        }
    } catch (err) {
        console.warn('[PERF] Redis L2 cache write error:', err);
    }

    return data;
};

export const invalidateCache = async (keyOrTag, isTag = false) => {
    if (!isTag) {
        L1_CACHE.delete(keyOrTag);
        await redisClient.del(keyOrTag);
        return;
    }

    const tagKey = `tag:${keyOrTag}`;
    try {
        const keys = await redisClient.smembers(tagKey);
        for (const key of keys) {
            L1_CACHE.delete(key);
            await redisClient.del(key);
        }
        await redisClient.del(tagKey);
    } catch (err) {
        console.warn('[PERF] Cache invalidation error:', err);
    }
};
