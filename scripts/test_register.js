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
    const json = JSON.parse(tokenResp.body || '{}');
    const csrfToken = json.csrfToken;
    const signed = json.signedCsrf;
    console.log('csrfToken', csrfToken ? 'present' : 'missing', 'signed', signed ? 'present' : 'missing');

    const testEmail = `test+${Date.now()}@example.com`;
    const payload = { firstName: 'Auto', lastName: 'Tester', email: testEmail, password: 'Password123!', googleApiKey: '1234567890' };
    console.log('Posting register for', testEmail);
    const registerResp = await fetchWithCookies(`${base}/api/users/register`, { method: 'POST', body: JSON.stringify(payload), headers: { 'X-XSRF-TOKEN': csrfToken } }, Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie || ''));

    console.log('register status', registerResp.status);
    console.log('register body:', registerResp.body);
  } catch (e) {
    console.error('test script error', e);
    process.exit(1);
  }
})();
