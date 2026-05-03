import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

// CSRF signing secret used for stateless signed tokens (fallback for cross-origin clients)
const CSRF_SIGNING_SECRET = (() => {
  if (process.env.CSRF_SIGNING_SECRET) return process.env.CSRF_SIGNING_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-csrf-signing-secret';
  }
  throw new Error('CSRF_SIGNING_SECRET must be set in production');
})();

export function signRawToken(raw) {
  return `${raw}.${createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url')}`;
}

export function verifySignedCsrfToken(signed) {
  try {
    if (!signed || typeof signed !== 'string') return false;
    const parts = signed.split('.');
    if (parts.length !== 2) return false;
    const [raw, sig] = parts;
    const expected = createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
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

export function createSignedCsrf() {
  const raw = `${Date.now()}:${randomBytes(12).toString('base64url')}`;
  return signRawToken(raw);
}

// Helper: determine whether cookies should be marked Secure + SameSite=None
// based on the incoming request or enforced environment flags. Extracted
// so the logic can be changed in a single place (proxies/CDNs aware).
export function isSecureFromRequest(req) {
  if (process.env.FORCE_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production') return true;
  if (!req) return false;
  try {
    // When 'trust proxy' is enabled in Express, req.secure correctly
    // reflects the X-Forwarded-Proto header from the trusted proxy.
    return Boolean(req.secure);
  } catch (e) {
    return false;
  }
}

// Utilities around exposing sensitive data in responses.
// By default we are conservative: do NOT expose OTPs unless explicitly
// enabled via EXPOSE_OTP=true. This avoids accidental leaks when
// `NODE_ENV` is unset or misconfigured on hosted environments.
export function shouldExposeOtpToClient() {
  const expose = String(process.env.EXPOSE_OTP || '').toLowerCase() === 'true';
  const ci = String(process.env.CI || '').toLowerCase() === 'true';
  return expose && !ci;
}
