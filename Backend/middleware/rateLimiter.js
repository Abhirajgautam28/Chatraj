import rateLimit from 'express-rate-limit';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Short window strict limiter for sensitive auth endpoints
export const sensitiveLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 5,
  message: { error: 'Too many requests - please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 subscription requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

export const sitemapLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General authenticated endpoints limiter
export const authLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const leaderboardLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 100,
});

export const usersLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 100,
});

export const registrationLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
});

// Project-related routes limiter
export const projectLimiter = rateLimit({
  windowMs: DEFAULT_WINDOW_MS,
  max: 100,
});

// Blog-related routes limiters
export const createBlogLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 50,
});

export const commentLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 100,
});

export const generateLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 50,
});

export const likeLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 200,
});

export const getBlogLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 300,
});

export const listBlogsLimiter = rateLimit({
    windowMs: DEFAULT_WINDOW_MS,
    max: 300,
});

export default {
  sensitiveLimiter,
  authLimiter,
  leaderboardLimiter,
  usersLimiter,
  registrationLimiter,
  projectLimiter,
  createBlogLimiter,
  commentLimiter,
  generateLimiter,
  likeLimiter,
  getBlogLimiter,
  listBlogsLimiter
};
