import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
dotenv.config();

let redisClient;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);

    redisClient.on('connect', () => {
        // intentionally quiet in normal runs
    });

    redisClient.on('error', (err) => {
        logger.error('Redis error:', err && (err.stack || err.message || err));
    });
} else {
    // Fallback lightweight in-memory mock for development when no REDIS_URL is provided.
    logger.warn('REDIS_URL not set — using in-memory Redis mock (development only)');
    const store = new Map();
    const timers = new Map();

    const clearTimerForKey = (k) => {
        const t = timers.get(k);
        if (t) {
            clearTimeout(t);
            timers.delete(k);
        }
    };

    redisClient = {
        get: async (k) => {
            const entry = store.get(k);
            if (!entry) return null;
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                store.delete(k);
                clearTimerForKey(k);
                return null;
            }
            return entry.value ?? null;
        },
        set: async (k, v, ...args) => {
            // Support: set(key, value) and set(key, value, 'EX', seconds) and set(key, value, 'PX', ms)
            let ttl = null;
            if (args && args.length >= 2) {
                const flag = String(args[0]).toUpperCase();
                const val = args[1];
                if (flag === 'EX') ttl = Number(val) * 1000;
                else if (flag === 'PX') ttl = Number(val);
            }

            const expiresAt = ttl ? Date.now() + ttl : null;
            store.set(k, { value: v, expiresAt });
            clearTimerForKey(k);
            if (ttl) {
                const to = setTimeout(() => {
                    store.delete(k);
                    timers.delete(k);
                }, ttl);
                timers.set(k, to);
            }
            return 'OK';
        },
        del: async (k) => {
            const existed = store.delete(k) ? 1 : 0;
            clearTimerForKey(k);
            return existed;
        },
        expire: async (k, seconds) => {
            const entry = store.get(k);
            if (!entry) return 0;
            const ttl = Number(seconds) * 1000;
            const expiresAt = Date.now() + ttl;
            entry.expiresAt = expiresAt;
            clearTimerForKey(k);
            const to = setTimeout(() => {
                store.delete(k);
                timers.delete(k);
            }, ttl);
            timers.set(k, to);
            return 1;
        },
        incr: async (k) => {
            const entry = store.get(k);
            let current = 0;
            let expiresAt = null;
            if (entry) {
                if (entry.expiresAt && Date.now() > entry.expiresAt) {
                    store.delete(k);
                    clearTimerForKey(k);
                } else {
                    current = Number(entry.value) || 0;
                    expiresAt = entry.expiresAt || null;
                }
            }
            const next = current + 1;
            store.set(k, { value: String(next), expiresAt });
            if (expiresAt) {
                clearTimerForKey(k);
                const remaining = expiresAt - Date.now();
                if (remaining > 0) timers.set(k, setTimeout(() => { store.delete(k); timers.delete(k); }, remaining));
            }
            return next;
        },
        decr: async (k) => {
            const entry = store.get(k);
            let current = 0;
            let expiresAt = null;
            if (entry) {
                if (entry.expiresAt && Date.now() > entry.expiresAt) {
                    store.delete(k);
                    clearTimerForKey(k);
                } else {
                    current = Number(entry.value) || 0;
                    expiresAt = entry.expiresAt || null;
                }
            }
            const next = current - 1;
            store.set(k, { value: String(next), expiresAt });
            if (expiresAt) {
                clearTimerForKey(k);
                const remaining = expiresAt - Date.now();
                if (remaining > 0) timers.set(k, setTimeout(() => { store.delete(k); timers.delete(k); }, remaining));
            }
            return next;
        },
        on: () => {},
        quit: async () => { store.clear(); timers.forEach(t => clearTimeout(t)); timers.clear(); return 'OK'; },
        flushdb: async () => { store.clear(); timers.forEach(t => clearTimeout(t)); timers.clear(); return 'OK'; }
    };
}

export default redisClient;
