import csurf from 'csurf';
import {
  verifySignedCsrfToken,
  createSignedCsrf,
  isSecureFromRequest
} from '../utils/security.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// CSRF protection middleware using cookies
export const csrfProtection = csurf({
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

/**
 * Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
 */
export const getCsrfTokenController = (req, res) => {
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
      sendSuccess(res, 200, { csrfToken: token, signedCsrf: signed });
    } catch (err) {
      sendError(res, 500, 'Failed to generate CSRF token');
    }
};

/**
 * Conditional CSRF middleware. Handles both cookie-based and stateless signed tokens.
 */
export const conditionalCsrfMiddleware = (req, res, next) => {
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
      // server-signed stateless CSRF token provided by trusted clients.
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
};

/**
 * CSRF global error handler
 */
export const csrfErrorHandler = (err, req, res, next) => {
    // Handle CSRF errors specially
    if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
      logger.error('CSRF validation failed:', err.message);
      return sendError(res, 403, 'Invalid CSRF token', process.env.NODE_ENV === 'development' ? err.message : 'Forbidden');
    }
    next(err);
};
