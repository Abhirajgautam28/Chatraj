import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

let redisClient;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (err) => console.error('Redis error:', err));
} else {
    console.warn('REDIS_URL not set — using advanced in-memory Redis mock');
    const store = new Map();
    const timers = new Map();
    const sortedSets = new Map(); // For Leaderboard support

    const clearTimerForKey = (k) => {
        if (timers.has(k)) {
            clearTimeout(timers.get(k));
            timers.delete(k);
        }
    };

    redisClient = {
        get: async (k) => {
            const entry = store.get(k);
            if (!entry) return null;
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                store.delete(k);
                return null;
            }
            return entry.value;
        },
        set: async (k, v, ...args) => {
            let ttl = null;
            if (args[0] === 'EX') ttl = parseInt(args[1]) * 1000;
            store.set(k, { value: v, expiresAt: ttl ? Date.now() + ttl : null });
            clearTimerForKey(k);
            if (ttl) {
                timers.set(k, setTimeout(() => store.delete(k), ttl));
            }
            return 'OK';
        },
        del: async (...ks) => {
            let count = 0;
            ks.flat().forEach(k => {
                if (store.delete(k) || sortedSets.delete(k)) count++;
                clearTimerForKey(k);
            });
            return count;
        },
        // Sorted Set Mock
        zadd: async (key, score, member) => {
            if (!sortedSets.has(key)) sortedSets.set(key, new Map());
            sortedSets.get(key).set(member, parseFloat(score));
            return 1;
        },
        zincrby: async (key, increment, member) => {
            if (!sortedSets.has(key)) sortedSets.set(key, new Map());
            const set = sortedSets.get(key);
            const current = set.get(member) || 0;
            const next = current + parseFloat(increment);
            set.set(member, next);
            return next;
        },
        zrevrange: async (key, start, stop, withScores) => {
            if (!sortedSets.has(key)) return [];
            const set = sortedSets.get(key);
            const entries = Array.from(set.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(start, stop + 1);

            if (withScores === 'WITHSCORES') {
                return entries.flatMap(e => [e[0], String(e[1])]);
            }
            return entries.map(e => e[0]);
        },
        smembers: async (key) => {
            const entry = store.get(key);
            return (entry && Array.isArray(entry.value)) ? entry.value : [];
        },
        sadd: async (key, member) => {
            const entry = store.get(key) || { value: [] };
            if (!entry.value.includes(member)) {
                entry.value.push(member);
                store.set(key, entry);
            }
            return 1;
        },
        // Pipeline Mock
        pipeline: () => {
            const commands = [];
            const p = {
                get: (k) => { commands.push(() => redisClient.get(k)); return p; },
                set: (k, v, ...args) => { commands.push(() => redisClient.set(k, v, ...args)); return p; },
                del: (k) => { commands.push(() => redisClient.del(k)); return p; },
                zadd: (k, s, m) => { commands.push(() => redisClient.zadd(k, s, m)); return p; },
                zincrby: (k, i, m) => { commands.push(() => redisClient.zincrby(k, i, m)); return p; },
                exec: async () => {
                    const results = [];
                    for (const cmd of commands) {
                        try { results.push([null, await cmd()]); }
                        catch (e) { results.push([e, null]); }
                    }
                    return results;
                }
            };
            return p;
        },
        quit: async () => 'OK'
    };
}

export default redisClient;
