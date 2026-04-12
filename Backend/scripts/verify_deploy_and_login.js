#!/usr/bin/env node
import { setTimeout as wait } from 'timers/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env relative to script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const args = process.argv.slice(2);
function arg(name, def) {
  const f = args.find(a => a.startsWith(`--${name}=`));
  if (f) return f.split('=')[1];
  return def;
}

const API = arg('api', process.env.BACKEND_URL || 'https://chatraj-backend.onrender.com');
const EMAIL = arg('email', process.env.TEST_USER_EMAIL || 'testuser@example.com');
const PASSWORD = arg('password', process.env.TEST_USER_PASSWORD || 'TestPass123!');
const TIMEOUT = Number(arg('timeout', '300000')); // 5 minutes default
const INTERVAL = Number(arg('interval', '15000'));

function extractSetCookieArray(resp) {
  // node-fetch / undici gives headers.raw()
  if (resp.headers && typeof resp.headers.raw === 'function') {
    const raw = resp.headers.raw();
    return raw && raw['set-cookie'] ? raw['set-cookie'] : [];
  }
  const single = resp.headers && resp.headers.get ? resp.headers.get('set-cookie') : null;
  if (!single) return [];
  // split on cookie boundaries
  return String(single).split(/,(?=\s*[^;]+?=)/g);
}

function buildCookieHeader(setCookieArray) {
  if (!Array.isArray(setCookieArray)) return '';
  return setCookieArray.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
}

async function checkCsrfFlags(api) {
  try {
    const resp = await fetch(`${api.replace(/\/$/, '')}/csrf-token`, { method: 'GET' });
    if (!resp) return null;
    const cookies = extractSetCookieArray(resp);
    for (const c of cookies) {
      if (/XSRF-TOKEN=/i.test(c)) {
        const hasSameSiteNone = /samesite=none/i.test(c);
        const hasSecure = /\bsecure\b/i.test(c);
        return { ok: true, hasSameSiteNone, hasSecure, cookies, tokenBody: await resp.text() };
      }
    }
    return { ok: true, hasSameSiteNone: false, hasSecure: false, cookies: extractSetCookieArray(resp) };
  } catch (e) {
    return null;
  }
}

async function attemptLogin(api, email, password) {
  try {
    const resp1 = await fetch(`${api.replace(/\/$/, '')}/csrf-token`, { method: 'GET' });
    if (!resp1.ok) return { ok: false, reason: 'csrf fetch failed', status: resp1.status };
    const body = await resp1.json().catch(() => null);
    const token = body && body.csrfToken ? body.csrfToken : null;
    const cookies = extractSetCookieArray(resp1);
    const cookieHeader = buildCookieHeader(cookies);

    const r2 = await fetch(`${api.replace(/\/$/, '')}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': token || '',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ email, password })
    });

    const text = await r2.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { }
    return { ok: r2.ok, status: r2.status, body: parsed || text };
  } catch (e) {
    return { ok: false, error: String(e && (e.message || e)) };
  }
}

async function run() {
  console.log(`Verifying deployed API: ${API}`);
  const deadline = Date.now() + TIMEOUT;
  while (Date.now() < deadline) {
    process.stdout.write('.');
    const res = await checkCsrfFlags(API);
    if (res === null) {
      console.log('\nEndpoint unreachable; retrying in', INTERVAL / 1000, 's');
    } else {
      console.log('\n/csrf-token returned. SameSite=None:', res.hasSameSiteNone, 'Secure:', res.hasSecure);
      if (res.hasSameSiteNone && res.hasSecure) {
        console.log('Desired cookie flags present. Attempting login test...');
        const loginRes = await attemptLogin(API, EMAIL, PASSWORD);
        console.log('Login test result:', loginRes);
        return;
      }
    }
    await wait(INTERVAL);
  }
  console.log('\nTimeout reached; cookie flags not updated.');
}

run().catch(e => { console.error(e && (e.stack || e)); process.exit(1); });
