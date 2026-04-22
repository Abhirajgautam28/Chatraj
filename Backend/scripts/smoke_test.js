import { loadEnv } from './script-utils.js';
import { extractSetCookieArray, buildCookieHeader } from '../utils/cookies.js';
import { logger } from '../utils/logger.js';

loadEnv();

const API = process.env.BACKEND_URL || 'http://localhost:8080';

async function run() {
  logger.info('Starting smoke test: GET /csrf-token then POST /api/users/login using test user');

  // 1) GET CSRF token
  const r1 = await fetch(`${API}/csrf-token`, { method: 'GET' });
  const cookies = extractSetCookieArray(r1);
  let token = null;
  try {
    const json = await r1.json();
    token = json.csrfToken;
  } catch (e) {
    logger.error('Failed to parse /csrf-token JSON: ' + (e && e.message));
  }

  logger.info('-- GET /csrf-token headers --');
  logger.info('set-cookie: ' + JSON.stringify(cookies));
  logger.info('csrfToken: ' + (token ? '[OK]' : '[MISSING]'));

  if (!token) {
    logger.error('No csrf token obtained; aborting smoke test');
    process.exit(1);
  }

  // 2) POST login with extracted cookies and header
  const email = process.env.TEST_USER_EMAIL || 'testuser@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'TestPass123!';

  const cookieHeader = buildCookieHeader(cookies);

  const r2 = await fetch(`${API}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': token,
      'Cookie': cookieHeader
    },
    body: JSON.stringify({ email, password })
  });

  logger.info('-- POST /api/users/login status -- ' + r2.status);
  const body = await r2.text();
  logger.info('-- body --');
  logger.info(body);

  if (r2.ok) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.token) {
        logger.info('Smoke test: login successful — token received');
        process.exit(0);
      }
    } catch (e) {
      logger.error('Unable to parse login response JSON');
    }
    logger.info('Login OK but no token in response');
    process.exit(1);
  } else {
    logger.error('Login failed with status ' + r2.status);
    process.exit(1);
  }
}

run().catch(err => { console.error(err && err.stack || err); process.exit(1); });
