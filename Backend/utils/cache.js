import redisClient from '../services/redis.service.js';

// Absolute Zenith Hybrid Caching with Pipelined L2 Operations
const L1_CACHE = new Map();
const L1_MAX_SIZE = 2000;
const L1_TTL = 30000;
const PENDING_PROMISES = new Map();

export const withCache = async (key, ttlSeconds, fetcher, tags = []) => {
    const cachedL1 = L1_CACHE.get(key);
    if (cachedL1 && Date.now() < cachedL1.expiry) {
        // Background refresh if near expiry
        if (Date.now() > (cachedL1.expiry - 5000) && !PENDING_PROMISES.has(key)) {
            refreshCache(key, ttlSeconds, fetcher, tags);
        }
        return cachedL1.data;
    }

    if (PENDING_PROMISES.has(key)) return await PENDING_PROMISES.get(key);

    const task = (async () => {
        try {
            if (typeof redisClient.get === 'function') {
                const cachedL2 = await redisClient.get(key);
                if (cachedL2) {
                    const data = JSON.parse(cachedL2);
                    setL1(key, data);
                    return data;
                }
            }
            const data = await fetcher();
            setL1(key, data);

            // Optimization: Atomic Pipeline for L2 set + tags
            if (typeof redisClient.pipeline === 'function') {
                const pipe = redisClient.pipeline();
                pipe.set(key, JSON.stringify(data), 'EX', ttlSeconds);
                for (const tag of tags) pipe.sadd(`tag:${tag}`, key);
                pipe.exec().catch(() => {});
            } else if (typeof redisClient.set === 'function') {
                await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            }

            return data;
        } finally {
            PENDING_PROMISES.delete(key);
        }
    })();

    PENDING_PROMISES.set(key, task);
    return await task;
};

async function refreshCache(key, ttl, fetcher, tags) {
    try {
        const data = await fetcher();
        setL1(key, data);
        if (typeof redisClient.pipeline === 'function') {
            const pipe = redisClient.pipeline();
            pipe.set(key, JSON.stringify(data), 'EX', ttl);
            for (const tag of tags) pipe.sadd(`tag:${tag}`, key);
            pipe.exec().catch(() => {});
        }
    } catch (e) {}
}

function setL1(key, data) {
    if (L1_CACHE.size >= L1_MAX_SIZE) L1_CACHE.delete(L1_CACHE.keys().next().value);
    L1_CACHE.set(key, { data, expiry: Date.now() + L1_TTL });
}

export const invalidateCache = async (keyOrTag, isTag = false) => {
    if (!isTag) {
        L1_CACHE.delete(keyOrTag);
        if (typeof redisClient.del === 'function') await redisClient.del(keyOrTag);
        return;
    }
    const tagKey = `tag:${keyOrTag}`;
    try {
        if (typeof redisClient.smembers === 'function') {
            const keys = await redisClient.smembers(tagKey);
            if (keys && keys.length > 0) {
                for (const key of keys) L1_CACHE.delete(key);
                if (typeof redisClient.del === 'function') await redisClient.del(...keys, tagKey);
            }
        }
    } catch (err) { console.error('[CACHE] Invalidation error:', err); }
};
