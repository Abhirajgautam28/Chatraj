import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

let redisClient;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);

    redisClient.on('connect', () => {
        // intentionally quiet in normal runs
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err && (err.stack || err.message || err));
    });
} else {
    // Fallback lightweight in-memory mock for development when no REDIS_URL is provided.
    console.warn('REDIS_URL not set — using in-memory Redis mock (development only)');
    const store = new Map();
    redisClient = {
        get: async (k) => store.get(k) ?? null,
        set: async (k, v) => { store.set(k, v); return 'OK'; },
        del: async (k) => { store.delete(k); return 1; },
        on: () => {}
    };
}

export default redisClient;