import cors from 'cors';
import { logger } from '../utils/logger.js';

const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
];

/**
 * Improved CORS middleware for Vercel/Render/localhost
 */
const dynamicCors = (origin, callback) => {
  const vercelRegex = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin) ||
    origin === 'null'
  ) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

/**
 * CORS debug logger middleware
 */
export const corsErrorLogger = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    logger.error('CORS error:', err.message, 'Origin:', req.headers.origin);
    res.status(403).json({ error: 'CORS error', details: err.message });
  } else {
    next(err);
  }
};

/**
 * Configure and return the CORS middleware
 */
export const configureCors = () => {
  return cors({
    origin: dynamicCors,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Allow the signed CSRF header used as a stateless fallback (X-CSRF-SIGNED)
    // so cross-origin frontends (Vercel) can include it during preflight checks.
    allowedHeaders: [
      'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin',
      'X-XSRF-TOKEN', 'X-CSRF-Token', 'X-CSRF-SIGNED'
    ],
    exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin']
  });
};
