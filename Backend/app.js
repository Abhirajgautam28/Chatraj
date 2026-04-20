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
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import crypto from 'crypto';

// CSRF signing secret used for stateless signed tokens (fallback for cross-origin clients)
const CSRF_SIGNING_SECRET = (() => {
  if (process.env.CSRF_SIGNING_SECRET) return process.env.CSRF_SIGNING_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('CSRF_SIGNING_SECRET not set — using development fallback (insecure)');
    return 'dev-csrf-signing-secret';
  }
  throw new Error('CSRF_SIGNING_SECRET must be set in production');
})();

function signRawToken(raw) {
  return `${raw}.${crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url')}`;
}

function verifySignedCsrfToken(signed) {
  try {
    if (!signed || typeof signed !== 'string') return false;
    const parts = signed.split('.');
    if (parts.length !== 2) return false;
    const [raw, sig] = parts;
    const expected = crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
    const idx = raw.indexOf(':');
    if (idx === -1) return false;
    const ts = Number(raw.slice(0, idx));
    if (Number.isNaN(ts)) return false;
    // token expiry: 1 hour
    if (Date.now() - ts > 1000 * 60 * 60) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function createSignedCsrf() {
  const raw = `${Date.now()}:${crypto.randomBytes(12).toString('base64url')}`;
  return signRawToken(raw);
}
const allowedOrigins = new Set([
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
]);


const app = express();

// Production performance tuning
if (process.env.NODE_ENV === 'production') {
  app.disable('x-powered-by');
  app.set('json spaces', 0);
}

// Helper: determine whether cookies should be marked Secure + SameSite=None
// based on the incoming request or enforced environment flags. Extracted
// so the logic can be changed in a single place (proxies/CDNs aware).
function isSecureFromRequest(req) {
  if (process.env.FORCE_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production') return true;
  if (!req) return false;
  try {
    return Boolean(req.secure || (req.headers && String(req.headers['x-forwarded-proto']) === 'https'));
  } catch (e) {
    return false;
  }
}

const VERCEL_ORIGIN_REGEX = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(`[PERF] Slow Request: ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    });
  }
  next();
};

// CORS debug logger
const corsErrorLogger = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    console.error('CORS error:', err.message, 'Origin:', req.headers.origin);
    res.status(403).json({ error: 'CORS error', details: err.message });
  } else {
    next(err);
  }
};

// Improved CORS middleware for Vercel/Render/localhost
const dynamicCors = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.has(origin) ||
    VERCEL_ORIGIN_REGEX.test(origin) ||
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

app.use(performanceLogger);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  // Handle CSRF errors specially
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    console.error('CSRF validation failed:', err.message);
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden'
    });
  }

  const status = err.status || 500;
  res.status(status).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

export default app;
