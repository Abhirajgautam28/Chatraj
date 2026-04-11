import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/Backend/.env' });

const API = process.env.BACKEND_URL || 'http://localhost:8080';

async function run() {
  console.log('Starting smoke test: GET /csrf-token then POST /api/users/login using test user');

  // 1) GET CSRF token
  const r1 = await fetch(`${API}/csrf-token`, { method: 'GET' });
  const setCookie = r1.headers.get('set-cookie');
  let token = null;
  try {
    const json = await r1.json();
    token = json.csrfToken;
  } catch (e) {
    console.error('Failed to parse /csrf-token JSON', e && e.message);
  }

  console.log('-- GET /csrf-token headers --');
  console.log('set-cookie:', setCookie);
  console.log('csrfToken:', token ? '[OK]' : '[MISSING]');

  if (!token) {
    console.error('No csrf token obtained; aborting smoke test');
    process.exit(1);
  }

  // 2) POST login with extracted cookies and header
  const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';
  const cookieHeader = setCookie ? setCookie.split(',').map(s => s.split(';')[0].trim()).join('; ') : '';

  const r2 = await fetch(`${API}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': token,
      'Cookie': cookieHeader
    },
    body: JSON.stringify({ email, password })
  });

  console.log('-- POST /api/users/login status --', r2.status);
  const body = await r2.text();
  console.log('-- body --');
  console.log(body);

  if (r2.ok) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.token) {
        console.log('Smoke test: login successful — token received');
        process.exit(0);
      }
    } catch (e) {
      console.error('Unable to parse login response JSON');
    }
    console.log('Login OK but no token in response');
    process.exit(1);
  } else {
    console.error('Login failed with status', r2.status);
    process.exit(1);
  }
}

run().catch(err => { console.error(err && err.stack || err); process.exit(1); });
