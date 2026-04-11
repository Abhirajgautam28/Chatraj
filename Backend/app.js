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
const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
];


const app = express();

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-XSRF-TOKEN', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin']
}));

// CORS preflight is handled by the global CORS middleware above

app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection middleware using cookies
// Configure the internal `_csrf` cookie options based on environment so its
// flags (httpOnly/secure/sameSite) align with the public `XSRF-TOKEN` cookie
// we set for client-side JS. We use env flags rather than per-request checks
// when initializing csurf because csurf's cookie option is static.
const FORCE_SECURE_COOKIES = process.env.FORCE_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production';
const csrfCookieOptions = {
  httpOnly: true,
  secure: Boolean(FORCE_SECURE_COOKIES),
  sameSite: FORCE_SECURE_COOKIES ? 'None' : 'Lax'
};
const csrfProtection = csurf({
  cookie: csrfCookieOptions,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
// Note: CSRF debug flag removed. Debug logging is gated by
// `NODE_ENV === 'development'` directly to avoid unused flags.

// Helper: sign/verify stateless CSRF tokens for cross-origin clients
const CSRF_SIGNING_SECRET = (() => {
  const v = process.env.CSRF_SIGNING_SECRET || process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!v) {
    // Only permit the insecure fallback in explicit development mode.
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning: CSRF_SIGNING_SECRET not set; falling back to insecure default for development only. Set CSRF_SIGNING_SECRET in non-development environments.');
      return 'change_me_now';
    }
    // For staging/production/other environments, require an explicit secret.
    throw new Error('CSRF_SIGNING_SECRET (or SESSION_SECRET/JWT_SECRET) must be set in non-development environments');
  }
  return v;
})();
function base64urlEncode(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlToBuffer(str) {
  let base64 = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64');
}
function signCsrfToken() {
  const ts = Date.now().toString();
  const nonce = crypto.randomBytes(12).toString('hex');
  const data = `${ts}:${nonce}`;
  const sig = crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(data).digest();
  return `${data}:${base64urlEncode(sig)}`;
}
function verifySignedCsrfToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [tsStr, nonce, sig] = parts;
  const ts = parseInt(tsStr, 10);
  if (Number.isNaN(ts)) return false;
  // token valid for 15 minutes
  if (Date.now() - ts > 1000 * 60 * 15) return false;
  const data = `${tsStr}:${nonce}`;
  const expected = crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(data).digest();
  let provided;
  try {
    provided = base64urlToBuffer(sig);
  } catch (e) {
    return false;
  }
  if (expected.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(expected, provided);
  } catch (e) {
    return false;
  }
}

// NOTE: `/debug/csrf-check` endpoint was removed after verification to
// prevent exposing CSRF internals in any environment. Use logs and the
// archived verification script (`Backend/archived-scripts/verify_deploy_and_login.js`)
// for further diagnostics.

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Conditional CSRF middleware:
// - For safe methods (GET/HEAD/OPTIONS) run csurf to generate a token and set
//   the `XSRF-TOKEN` cookie so browser JS (axios) can read it and send it back
//   as `X-XSRF-TOKEN` on state-changing requests.
// - For unsafe methods, run the csurf middleware to validate the token.
app.use((req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // For safe methods, generate the csurf token and also produce a signed
  // stateless token we can return to cross-origin clients. The signed token
  // can be verified on unsafe requests without relying on the browser to
  // accept/send third-party cookies.
  if (safeMethods.includes(req.method)) {
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
            // Prevent caching of token responses to avoid stale body vs cookie mismatches
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Surrogate-Control', 'no-store');
            res.set('Vary', 'Origin');
            // server-set cookie for legacy/same-origin clients
            res.cookie('XSRF-TOKEN', token, cookieOptions);
            // attach a signed token for cross-origin clients to use in headers
            req.signedCsrfToken = signCsrfToken();
          }
        } catch (e) {
          // ignore token generation errors for safe methods
        }
      }
      next(err);
    });
    return;
  }

  // For unsafe methods, first accept a signed token in the header (stateless
  // approach). If present and valid, bypass csurf cookie verification.
  const header = req.get('X-XSRF-TOKEN') || req.get('X-CSRF-TOKEN');
  if (header && verifySignedCsrfToken(header)) {
    return next();
  }

  // Otherwise fallback to cookie-based csurf verification.
  csrfProtection(req, res, next);
});

// Route: return CSRF token for clients. For cross-origin clients we return
// the signed token (req.signedCsrfToken) so the client can send it in the
// `X-XSRF-TOKEN` header; legacy clients will still receive the server-set
// `XSRF-TOKEN` cookie.
app.get('/csrf-token', (req, res) => {
  try {
    const isSecureRequest = isSecureFromRequest(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Surrogate-Control', 'no-store');
    res.set('Vary', 'Origin');

    // If the middleware generated a signed token, return that; otherwise
    // produce a fresh signed token.
    const signed = req.signedCsrfToken || signCsrfToken();
    return res.status(200).json({ csrfToken: signed });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

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
    // Helpful debug information (avoid logging full tokens in production)
    try {
      // Development-only CSRF debug logging — avoid exposing token details
      if (process.env.NODE_ENV === 'development') {
        const headerToken = req.get('X-XSRF-TOKEN') || req.get('X-CSRF-TOKEN') || null;
        const cookieSecret = req.cookies && req.cookies._csrf ? `[present,len=${String(req.cookies._csrf).length}]` : '[missing]';
        console.error('CSRF debug: header present=', Boolean(headerToken), 'headerLen=', headerToken ? headerToken.length : 0, ' cookie:', cookieSecret, ' origin=', req.headers.origin, ' host=', req.headers.host);
      }
    } catch (e) {
      // ignore logging errors
    }
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
