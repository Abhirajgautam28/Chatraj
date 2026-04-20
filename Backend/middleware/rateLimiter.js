import rateLimit from 'express-rate-limit';
import redisClient from '../services/redis.service.js';

// Custom Redis store for cluster-safe rate limiting
const redisStore = {
  // express-rate-limit 6.x+ store interface
  increment: async (key) => {
    const hits = await redisClient.incr(`rl:${key}`);
    if (hits === 1) await redisClient.expire(`rl:${key}`, 900); // Default 15m
    return { totalHits: hits, resetTime: undefined };
  },
  decrement: async (key) => {
    await redisClient.decr(`rl:${key}`);
  },
  resetKey: async (key) => {
    await redisClient.del(`rl:${key}`);
  }
};

const store = process.env.REDIS_URL ? redisStore : undefined;

// Short window strict limiter for sensitive auth endpoints
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many requests - please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store
});

// General authenticated endpoints limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store
});

export const leaderboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store
});

export const usersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store
});

export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  store
});

export const projectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store
});

export default { sensitiveLimiter, authLimiter, leaderboardLimiter, usersLimiter, registrationLimiter, projectLimiter };
