import http from 'http';
import https from 'https';
import { URL } from 'url';

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
          // Reject on HTTP errors so callers can decide how to handle them
          if (res.statusCode >= 400) {
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
    const base = 'http://localhost:8080';
    console.log('Requesting /csrf-token...');
    const tokenResp = await fetchWithCookies(`${base}/csrf-token`);
    console.log('csrf-token status', tokenResp.status);
    const setCookie = tokenResp.headers['set-cookie'];
    console.log('set-cookie header:', setCookie);
    let json;
    try {
      json = tokenResp.body ? JSON.parse(tokenResp.body) : {};
    } catch (err) {
      const parseErr = new Error('Failed to parse /csrf-token JSON response');
      parseErr.cause = err;
      parseErr.details = { body: tokenResp.body, status: tokenResp.status, headers: tokenResp.headers };
      throw parseErr;
    }

    const csrfToken = json.csrfToken;
    const signed = json.signedCsrf;
    console.log('csrfToken', csrfToken ? 'present' : 'missing', 'signed', signed ? 'present' : 'missing');

    if (!csrfToken) {
      const err = new Error('No csrfToken returned from /csrf-token; aborting test.');
      err.details = { status: tokenResp.status, headers: tokenResp.headers, body: tokenResp.body };
      throw err;
    }
    if (!setCookie) {
      const err = new Error('No Set-Cookie header returned from /csrf-token; cookies may be blocked. Aborting.');
      err.details = { status: tokenResp.status, headers: tokenResp.headers, body: tokenResp.body };
      throw err;
    }

    const testEmail = `test+${Date.now()}@example.com`;
    const payload = { firstName: 'Auto', lastName: 'Tester', email: testEmail, password: 'Password123!', googleApiKey: '1234567890' };
    console.log('Posting register for', testEmail);
    const registerResp = await fetchWithCookies(`${base}/api/users/register`, { method: 'POST', body: JSON.stringify(payload), headers: { 'X-XSRF-TOKEN': csrfToken } }, Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || ''));

    console.log('register status', registerResp.status);
    console.log('register body:', registerResp.body);

    // Fail fast on unexpected HTTP status codes so test failures are obvious
    if (registerResp.status < 200 || registerResp.status >= 300) {
      const statusErr = new Error('Registration failed with unexpected status ' + registerResp.status);
      statusErr.details = { status: registerResp.status, headers: registerResp.headers, body: registerResp.body };
      throw statusErr;
    }

    // Registration endpoint is expected to return JSON in normal operation.
    // Treat non-JSON responses as a hard failure to catch regressions (e.g. HTML error pages).
    try {
      const parsed = registerResp.body ? JSON.parse(registerResp.body) : {};
      console.log('Parsed register JSON:', parsed);
    } catch (err) {
      const parseErr = new Error('Registration response is not valid JSON');
      parseErr.details = {
        error: err,
        status: registerResp.status,
        headers: {
          'content-type': registerResp.headers?.['content-type'] ?? registerResp.headers?.['Content-Type'],
          location: registerResp.headers?.location ?? registerResp.headers?.Location,
          raw: registerResp.headers,
        },
        body: registerResp.body,
      };
      throw parseErr;
    }
  } catch (e) {
    console.error('test script error', e);
    if (e && e.details) console.error('details:', e.details);
    process.exit(1);
  }
})();
