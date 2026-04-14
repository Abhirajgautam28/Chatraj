import http from 'http';
import { URL } from 'url';

async function fetchWithCookies(url, options = {}, cookies = '') {
  const u = new URL(url);
  const headers = Object.assign({}, options.headers || {});
  if (cookies) headers['Cookie'] = cookies;
  headers['Accept'] = headers['Accept'] || 'application/json';
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + (u.search || ''),
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, headers: res.headers, body });
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
      console.error('Failed to parse /csrf-token JSON response:', err);
      console.error('Response body:', tokenResp.body);
      process.exit(1);
    }

    const csrfToken = json.csrfToken;
    const signed = json.signedCsrf;
    console.log('csrfToken', csrfToken ? 'present' : 'missing', 'signed', signed ? 'present' : 'missing');

    if (!csrfToken) {
      console.error('No csrfToken returned from /csrf-token; aborting test.');
      process.exit(1);
    }
    if (!setCookie) {
      console.error('No Set-Cookie header returned from /csrf-token; cookies may be blocked. Aborting.');
      process.exit(1);
    }

    const testEmail = `test+${Date.now()}@example.com`;
    const payload = { firstName: 'Auto', lastName: 'Tester', email: testEmail, password: 'Password123!', googleApiKey: '1234567890' };
    console.log('Posting register for', testEmail);
    const registerResp = await fetchWithCookies(`${base}/api/users/register`, { method: 'POST', body: JSON.stringify(payload), headers: { 'X-XSRF-TOKEN': csrfToken } }, Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || ''));

    console.log('register status', registerResp.status);
    console.log('register body:', registerResp.body);

    // Fail fast on unexpected HTTP status codes so test failures are obvious
    if (registerResp.status < 200 || registerResp.status >= 300) {
      console.error('Registration failed with unexpected status', { status: registerResp.status, body: registerResp.body });
      process.exit(1);
    }

    // Registration endpoint is expected to return JSON in normal operation.
    // Treat non-JSON responses as a hard failure to catch regressions (e.g. HTML error pages).
    try {
      const parsed = registerResp.body ? JSON.parse(registerResp.body) : {};
      console.log('Parsed register JSON:', parsed);
    } catch (err) {
      console.error('Registration response is not valid JSON:', { error: err, body: registerResp.body });
      process.exit(1);
    }
  } catch (e) {
    console.error('test script error', e);
    process.exit(1);
  }
})();
