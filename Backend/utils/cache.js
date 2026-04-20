import redisClient from '../services/redis.service.js';

// Simple in-memory LRU-like cache for extremely hot keys
const localCache = new Map();
const LOCAL_CACHE_TTL = 5000; // 5 seconds for local cache

export const withCache = async (key, ttl, fetchFn, tags = []) => {
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
        localCache.set(key, { data, timestamp: now, tags });

        // Link tags to key in Redis
        if (tags && tags.length > 0) {
            for (const tag of tags) {
                await redisClient.sadd(`cache:tag:${tag}`, key);
                await redisClient.expire(`cache:tag:${tag}`, 86400); // Tag mapping TTL 24h
            }
        }
    } catch (err) {
        console.error(`Cache write error for key ${key}:`, err);
    }

    return data;
};

export const invalidateCache = async (keyOrTag, isTag = false) => {
    try {
        if (!isTag) {
            localCache.delete(keyOrTag);
            await redisClient.del(keyOrTag);
        } else {
            // Tag-based invalidation
            // Clear L1
            for (const [k, v] of localCache.entries()) {
                if (v.tags && v.tags.includes(keyOrTag)) {
                    localCache.delete(k);
                }
            }
            // Clear L2
            const keys = await redisClient.smembers(`cache:tag:${keyOrTag}`);
            if (keys && keys.length > 0) {
                await redisClient.del(...keys);
                await redisClient.del(`cache:tag:${keyOrTag}`);
            }
        }
    } catch (err) {
        console.error(`Cache invalidation error for ${isTag ? 'tag' : 'key'} ${keyOrTag}:`, err);
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
