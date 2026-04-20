import crypto from 'crypto';

// CSRF signing secret used for stateless signed tokens (fallback for cross-origin clients)
const CSRF_SIGNING_SECRET = (() => {
  if (process.env.CSRF_SIGNING_SECRET) return process.env.CSRF_SIGNING_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-csrf-signing-secret';
  }
  throw new Error('CSRF_SIGNING_SECRET must be set in production');
})();

/**
 * Checks if sensitive data (like OTPs) should be exposed to the client.
 * @returns {boolean}
 */
export function shouldExposeOtpToClient() {
  const expose = String(process.env.EXPOSE_OTP || '').toLowerCase() === 'true';
  const ci = String(process.env.CI || '').toLowerCase() === 'true';
  return expose && !ci;
}

/**
 * Determines if cookies should be secure based on the request and environment.
 * @param {object} req - Express request object.
 * @returns {boolean}
 */
export function isSecureFromRequest(req) {
  if (process.env.FORCE_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production') return true;
  if (!req) return false;
  try {
    return Boolean(req.secure || (req.headers && String(req.headers['x-forwarded-proto']) === 'https'));
  } catch (e) {
    return false;
  }
}

/**
 * Signs a raw CSRF token.
 * @param {string} raw - Raw token string.
 * @returns {string} - Signed token.
 */
export function signRawToken(raw) {
  return `${raw}.${crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url')}`;
}

/**
 * Verifies a signed CSRF token.
 * @param {string} signed - Signed token string.
 * @returns {boolean}
 */
export function verifySignedCsrfToken(signed) {
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

/**
 * Creates a signed stateless CSRF token.
 * @returns {string}
 */
export function createSignedCsrf() {
  const raw = `${Date.now()}:${crypto.randomBytes(12).toString('base64url')}`;
  return signRawToken(raw);
}

export default {
  shouldExposeOtpToClient,
  isSecureFromRequest,
  signRawToken,
  verifySignedCsrfToken,
  createSignedCsrf
};
