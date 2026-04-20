import redisClient from '../services/redis.service.js';

// Simple in-memory LRU-like cache for extremely hot keys
const localCache = new Map();
const LOCAL_CACHE_TTL = 5000; // 5 seconds for local cache

export const withCache = async (key, ttl, fetchFn) => {
    // 1. Try local memory cache (L1)
    const now = Date.now();
    const local = localCache.get(key);
    if (local && (now - local.timestamp < LOCAL_CACHE_TTL)) {
        return local.data;
    }

    try {
        // 2. Try Redis cache (L2)
        const cached = await redisClient.get(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            localCache.set(key, { data: parsed, timestamp: now });
            return parsed;
        }
    } catch (err) {
        console.error(`Cache read error for key ${key}:`, err);
    }

    // 3. Fetch from source
    const data = await fetchFn();

    try {
        // 4. Update both caches
        await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
        localCache.set(key, { data, timestamp: now });
    } catch (err) {
        console.error(`Cache write error for key ${key}:`, err);
    }

    return data;
};

export const invalidateCache = async (key) => {
    try {
        localCache.delete(key);
        await redisClient.del(key);
    } catch (err) {
        console.error(`Cache invalidation error for key ${key}:`, err);
    }
};

// Periodic local cache cleanup
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of localCache.entries()) {
        if (now - value.timestamp > LOCAL_CACHE_TTL * 2) {
            localCache.delete(key);
        }
    }
}, 60000).unref();
