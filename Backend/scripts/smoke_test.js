import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/Backend/.env' });

const API = process.env.BACKEND_URL || 'http://localhost:8080';

async function run() {

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


  if (!token) {
    console.error('No csrf token obtained; aborting smoke test');
    process.exit(1);
  }

  // 2) POST login with extracted cookies and header
  const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';

  // Build a robust Cookie header from potential multiple Set-Cookie header values.
  // Handles:
  //   - An array of Set-Cookie header strings (when available via headers.raw())
  //   - A single combined string with commas inside attributes (e.g. Expires)
  const cookieHeader = (() => {
    if (!setCookie) return '';

    // If the underlying headers implementation exposes the raw() function, use it.
    if (typeof r1.headers.raw === 'function') {
      const raw = r1.headers.raw();
      const arr = raw && raw['set-cookie'];
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
      }
    }

    // Fallback: split a combined header string only on 'real' cookie boundaries.
    // We split on commas that are followed by optional spaces and then a token
    // containing an '=' before the next semicolon, which indicates a new cookie.
    const pieces = String(setCookie).split(/,(?=\s*[^;]+?=)/g);

    return pieces.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  })();

  const r2 = await fetch(`${API}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': token,
      'Cookie': cookieHeader
    },
    body: JSON.stringify({ email, password })
  });

  const body = await r2.text();

  if (r2.ok) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.token) {
        process.exit(0);
      }
    } catch (e) {
      console.error('Unable to parse login response JSON');
    }
    process.exit(1);
  } else {
    console.error('Login failed with status', r2.status);
    process.exit(1);
  }
}

run().catch(err => { console.error(err && err.stack || err); process.exit(1); });
