import http from 'http';
import https from 'https';
import { URL } from 'url';

// Small helper Error class so we consistently attach `details` and
// preserve an optional `cause`. Centralizing makes tests easier to
// handle and avoids ad-hoc attachment of properties on Error instances.
class TestError extends Error {
  constructor(message, details = {}, cause) {
    super(message);
    this.name = 'TestError';
    if (cause) this.cause = cause;
    this.details = details;
  }
}

// Helpers to sanitize headers/body before logging so CI/shared logs
// don't leak cookies, tokens or large payloads. We keep content-type
// and location, but redact cookies and authorization headers.
const SENSITIVE_HEADER_KEYS = ['set-cookie', 'cookie', 'authorization'];
function sanitizeHeaders(headers = {}) {
  const out = {};
  try {
    for (const k of Object.keys(headers || {})) {
      const lk = k.toLowerCase();
      if (SENSITIVE_HEADER_KEYS.includes(lk)) {
        out[k] = '<redacted>';
      } else if (lk === 'content-type' || lk === 'location') {
        out[k] = headers[k];
      } else {
        // keep small non-sensitive headers but avoid dumping huge raw objects
        const v = headers[k];
        if (typeof v === 'string' && v.length < 200) out[k] = v;
      }
    }
  } catch (e) {
    return { error: '<failed to sanitize headers>' };
  }
  return out;
}

const SENSITIVE_BODY_KEYS = new Set(['token', 'otp', 'password', 'authorization']);
function maskObjectSensitive(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskObjectSensitive);
  const out = {};
  for (const k of Object.keys(obj)) {
    try {
      if (SENSITIVE_BODY_KEYS.has(k.toLowerCase())) {
        out[k] = '<redacted>';
      } else if (typeof obj[k] === 'object') {
        out[k] = maskObjectSensitive(obj[k]);
      } else if (typeof obj[k] === 'string' && obj[k].length > 500) {
        out[k] = obj[k].slice(0, 200) + '...<truncated>';
      } else {
        out[k] = obj[k];
      }
    } catch (e) {
      out[k] = '<unable to read>';
    }
  }
  return out;
}

function sanitizeBody(body) {
  if (body == null) return body;
  if (typeof body !== 'string') return body;
  try {
    const parsed = JSON.parse(body);
    return maskObjectSensitive(parsed);
  } catch (e) {
    // Not JSON - truncate long HTML/error pages to avoid leaking content
    return body.length > 1000 ? body.slice(0, 1000) + '...<truncated>' : body;
  }
}

function sanitizeResponse(resp = {}) {
  return {
    status: resp.status,
    headers: sanitizeHeaders(resp.headers),
    body: sanitizeBody(resp.body),
  };
}

// Build enriched details for TestError: sanitized response plus any
// original fetch error details (also sanitized) so callers retain full
// context when we re-wrap errors.
function buildErrorDetails(resp = {}, err) {
  const details = sanitizeResponse(resp);
  try {
    if (err && err.details) {
      details.originalFetch = sanitizeResponse(err.details);
    }
  } catch (e) {
    // best-effort: don't throw while trying to build details
  }
  return details;
}

async function fetchWithCookies(url, options = {}, cookies = '') {
  const u = new URL(url);
  const headers = Object.assign({}, options.headers || {});
  if (cookies) headers['Cookie'] = cookies;
  headers['Accept'] = headers['Accept'] || 'application/json';
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  return new Promise((resolve, reject) => {
    const transport = u.protocol === 'https:' ? https : http;
    const port = u.port || (u.protocol === 'https:' ? 443 : 80);
    const req = transport.request(
      {
        hostname: u.hostname,
        port,
        path: u.pathname + (u.search || ''),
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const response = { status: res.statusCode, headers: res.headers, body };
          // By default keep the old behaviour and resolve with the response
          // object even for >=400 statuses. Consumers that want an exception
          // for HTTP errors can opt-in by setting `options.rejectOnHttpError`.
          const rejectOnHttpError = Boolean(options && options.rejectOnHttpError);
          if (res.statusCode >= 400 && rejectOnHttpError) {
            const err = new Error('HTTP Error: ' + res.statusCode);
            err.details = response;
            reject(err);
            return;
          }
          resolve(response);
        });
      }
    ).on('error', reject);

    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:8080';
    console.log('Requesting /csrf-token...');
    const tokenResp = await fetchWithCookies(`${base}/csrf-token`);
    console.log('csrf-token status', tokenResp.status);
    const setCookie = tokenResp.headers['set-cookie'];
    console.log('set-cookie header (sanitized):', sanitizeHeaders(tokenResp.headers));
    // Reuse a single cookie header string for subsequent requests to avoid
    // duplicating the Array.isArray(...) join logic in multiple places.
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || '');
    let json;
    try {
      json = tokenResp.body ? JSON.parse(tokenResp.body) : {};
    } catch (err) {
      throw new TestError('Failed to parse /csrf-token JSON response', buildErrorDetails(tokenResp, err), err);
    }

    const csrfToken = json.csrfToken;
    const signed = json.signedCsrf;
    console.log('csrfToken', csrfToken ? 'present' : 'missing', 'signed', signed ? 'present' : 'missing');

    if (!csrfToken) {
      throw new TestError('No csrfToken returned from /csrf-token; aborting test.', sanitizeResponse(tokenResp));
    }
    if (!setCookie) {
      throw new TestError('No Set-Cookie header returned from /csrf-token; cookies may be blocked. Aborting.', sanitizeResponse(tokenResp));
    }

    const testEmail = `test+${Date.now()}@example.com`;
    const payload = { firstName: 'Auto', lastName: 'Tester', email: testEmail, password: 'Password123!', googleApiKey: '1234567890' };
    console.log('Posting register for', testEmail);
    const registerResp = await fetchWithCookies(`${base}/api/users/register`, { method: 'POST', body: JSON.stringify(payload), headers: { 'X-XSRF-TOKEN': csrfToken } }, cookieHeader);

    console.log('register status', registerResp.status);
    console.log('register response (sanitized):', sanitizeResponse(registerResp));

    // Fail fast on unexpected HTTP status codes so test failures are obvious
    if (registerResp.status < 200 || registerResp.status >= 300) {
      throw new TestError('Registration failed with unexpected status ' + registerResp.status, sanitizeResponse(registerResp));
    }

    // Registration endpoint is expected to return JSON in normal operation.
    // Treat non-JSON responses as a hard failure to catch regressions (e.g. HTML error pages).
    try {
      const parsed = registerResp.body ? JSON.parse(registerResp.body) : {};
      console.log('Parsed register JSON (sanitized):', maskObjectSensitive(parsed));
      // If the server returned an OTP (common in dev/test), verify it to complete login flow
      if (parsed && parsed.otp && parsed.userId) {
        console.log('Verifying returned OTP to complete login flow...');
        const verifyResp = await fetchWithCookies(`${base}/api/users/verify-otp`, { method: 'POST', body: JSON.stringify({ userId: parsed.userId, otp: parsed.otp }), headers: { 'X-XSRF-TOKEN': csrfToken } }, cookieHeader);
        console.log('verify response (sanitized):', sanitizeResponse(verifyResp));
        try {
          const vparsed = verifyResp.body ? JSON.parse(verifyResp.body) : {};
          console.log('Parsed verify JSON (sanitized):', maskObjectSensitive(vparsed));
        } catch (err) {
          throw new TestError('Verify response is not valid JSON', buildErrorDetails(verifyResp, err), err);
        }
      }
    } catch (err) {
      throw new TestError('Registration response is not valid JSON', buildErrorDetails(registerResp, err), err);
    }
  } catch (e) {
    // Print a short error message and sanitized details to avoid leaking secrets
    console.error('test script error', e && e.message ? e.message : e);
    if (e && e.details) {
      // e.details might already be a sanitized response (we used sanitizeResponse when throwing),
      // but in case it isn't, normalize / sanitize the known shapes.
      const details = e.details && e.details.status ? sanitizeResponse(e.details) : {
        ...(e.details || {}),
        headers: sanitizeHeaders(e.details?.headers),
        body: sanitizeBody(e.details?.body),
      };
      console.error('details:', details);
    }
    process.exit(1);
  }
})();
