import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import setupRoutes from './routes/setup.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import blogRoutes from './routes/blog.routes.js';
import diagnosticRoutes from './routes/diagnostic.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import { logger } from './utils/logger.js';
import {
  verifySignedCsrfToken,
  createSignedCsrf,
  isSecureFromRequest
} from './utils/security.js';

const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
];


const app = express();

// Trust the first proxy (e.g. Vercel, Render) to allow Express to correctly
// extract the client's real IP from X-Forwarded-For and detect HTTPS.
app.set('trust proxy', 1);

// CORS debug logger
const corsErrorLogger = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    logger.error('CORS error:', err.message, 'Origin:', req.headers.origin);
    res.status(403).json({ error: 'CORS error', details: err.message });
  } else {
    next(err);
  }
};

// Improved CORS middleware for Vercel/Render/localhost
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

// Apply CORS as the very first middleware
app.use(cors({
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
}));

// CORS preflight is handled by the global CORS middleware above

app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection middleware using cookies
const csrfProtection = csurf({
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
// Expose `/csrf-token` in non-test environments so clients can obtain a
// browser-readable token (and a signed fallback) when CSRF protection is
// enabled. In test runs we skip CSRF entirely to avoid test flakiness.
if (process.env.NODE_ENV !== 'test') {
  app.get('/csrf-token', csrfProtection, (req, res) => {
    try {
      const token = req.csrfToken();
      // Determine secure cookie settings from runtime request (handles proxies/CDNs)
      const isSecureRequest = isSecureFromRequest(req);
      const cookieOptions = {
        httpOnly: false,
        secure: Boolean(isSecureRequest),
        sameSite: isSecureRequest ? 'None' : 'Lax'
      };
      // csurf will set its own `_csrf` cookie when configured with `cookie: true`;
      // set a browser-friendly `XSRF-TOKEN` cookie too so axios can read it.
      res.cookie('XSRF-TOKEN', token, cookieOptions);
      // Also provide a signed, stateless CSRF token in the response body so
      // clients that cannot reliably use cookies (third-party cookie blocks,
      // strict privacy modes, etc.) can use this token as a fallback. The
      // signed token is time-limited and verified server-side.
      const signed = createSignedCsrf();
      res.status(200).json({ csrfToken: token, signedCsrf: signed });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
  });
}

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Conditional CSRF middleware. For test runs we skip CSRF entirely to keep
// unit and integration tests deterministic and avoid having to fetch/attach
// tokens in every test. In non-test environments we apply the standard
// behavior: generate tokens for safe methods, validate for unsafe methods
// and accept a signed stateless fallback when present.
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => next());
} else {
  app.use((req, res, next) => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      // run csrfProtection to generate token for safe requests
      csrfProtection(req, res, (err) => {
        if (!err) {
          try {
            const token = req.csrfToken && req.csrfToken();
            if (token) {
              const isSecureRequest = isSecureFromRequest(req);
              const cookieOptions = {
                httpOnly: false,
                secure: Boolean(isSecureRequest),
                sameSite: isSecureRequest ? 'None' : 'Lax'
              };
              res.cookie('XSRF-TOKEN', token, cookieOptions);
            }
          } catch (e) {
            // ignore token generation errors for safe methods
          }
        }
        next(err);
      });
    } else {
      // For unsafe methods, allow either the standard csurf validation or a
      // server-signed stateless CSRF token provided by trusted clients. This
      // helps support cross-origin frontends (e.g., Vercel) that cannot
      // persist third-party cookies in some browsers.
      try {
        const signedHeader = req.headers['x-csrf-signed'] || req.headers['x-csrf-signed-token'];
        if (signedHeader && verifySignedCsrfToken(signedHeader)) {
          // Signed token valid — bypass csurf validation for this request.
          return next();
        }
      } catch (e) {
        // ignore and fall through to regular csurf validation
      }
      // validate token for unsafe methods using csurf
      csrfProtection(req, res, next);
    }
  });
}

app.use('/api/setup', setupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/diagnostics', diagnosticRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  // Handle CSRF errors specially
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    logger.error('CSRF validation failed:', err.message);
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden'
    });
  }

  const status = err.status || 500;
  if (!res.headersSent) {
    res.status(status).json({
      error: 'Something broke!',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
  }
});

export default app;
