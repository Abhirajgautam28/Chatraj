import rateLimit from 'express-rate-limit';

// Short window strict limiter for sensitive auth endpoints
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // In production keep a strict limit; relax during local dev/test runs to
  // avoid tripping the limiter during automated E2E scenarios.
  max: process.env.NODE_ENV === 'production' ? 5 : 1000,
  message: { error: 'Too many requests - please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General authenticated endpoints limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export default { sensitiveLimiter, authLimiter };
