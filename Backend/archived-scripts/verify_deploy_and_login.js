#!/usr/bin/env node
import { setTimeout as wait } from 'timers/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractSetCookieArray, buildCookieHeader } from '../utils/cookies.js';

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

const API_RAW = arg('api', process.env.BACKEND_URL || 'https://chatraj-backend.onrender.com');
const API = String(API_RAW).replace(/\/+$/, ''); // normalized base without trailing slash
const EMAIL = arg('email', process.env.TEST_USER_EMAIL || 'testuser@example.com');
const PASSWORD = arg('password', process.env.TEST_USER_PASSWORD || 'TestPass123!');
const TIMEOUT = Number(arg('timeout', '300000')); // 5 minutes default
const INTERVAL = Number(arg('interval', '15000'));

async function checkCsrfFlags(apiBase) {
  try {
    const resp = await fetch(`${apiBase}/csrf-token`, { method: 'GET' });
    if (!resp) return { ok: false, error: 'no response from fetch' };
    const status = resp.status;
    const statusText = resp.statusText || '';
    const cookies = extractSetCookieArray(resp);
    const bodyText = await resp.text().catch(() => '');
    let bodyJson = null;
    try { bodyJson = JSON.parse(bodyText); } catch (e) { /* ignore */ }

    if (!resp.ok) {
      return { ok: false, status, statusText, bodyText, cookies };
    }

    for (const c of cookies) {
      if (/XSRF-TOKEN=/i.test(c)) {
        const hasSameSiteNone = /samesite=none/i.test(c);
        const hasSecure = /\bsecure\b/i.test(c);
        return { ok: true, hasSameSiteNone, hasSecure, cookies, tokenBodyText: bodyText, tokenBodyJson: bodyJson };
      }
    }

    return { ok: true, hasSameSiteNone: false, hasSecure: false, cookies, tokenBodyText: bodyText, tokenBodyJson: bodyJson };
  } catch (e) {
    return { ok: false, error: String(e), stack: e && e.stack };
  }
}

async function attemptLogin(apiBase, email, password) {
  try {
    const resp1 = await fetch(`${apiBase}/csrf-token`, { method: 'GET' });
    if (!resp1) return { ok: false, error: 'no response from csrf fetch' };
    const status1 = resp1.status;
    const statusText1 = resp1.statusText || '';
    const cookies = extractSetCookieArray(resp1);
    const bodyText = await resp1.text().catch(() => '');
    let bodyJson = null;
    try { bodyJson = JSON.parse(bodyText); } catch (e) { }
    const token = (bodyJson && bodyJson.csrfToken) ? bodyJson.csrfToken : (typeof bodyText === 'string' ? (bodyText.match(/"csrfToken"\s*:\s*"([^\"]+)"/)?.[1] || '') : '');

    const cookieHeader = buildCookieHeader(cookies);

    const r2 = await fetch(`${apiBase}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': token || '',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ email, password })
    });

    const text = await r2.text().catch(() => '');
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { }
    if (!r2.ok) {
      return { ok: false, status: r2.status, statusText: r2.statusText || '', bodyText: text, bodyJson: parsed, cookies, csrfTokenSent: token };
    }
    return { ok: true, status: r2.status, bodyJson: parsed || null, bodyText: text, cookies, csrfTokenSent: token };
  } catch (e) {
    return { ok: false, error: String(e), stack: e && e.stack };
  }
}

async function run() {
  console.log(`Verifying deployed API: ${API}`);
  const deadline = Date.now() + TIMEOUT;
  while (Date.now() < deadline) {
    process.stdout.write('.');
    const res = await checkCsrfFlags(API);
    if (!res || res.ok === false) {
      console.log('\n/csrf-token fetch error:', res && res.error ? res.error : `status ${res && res.status || 'unknown'}`);
    } else {
      console.log(`\n/csrf-token returned. SameSite=None: ${res.hasSameSiteNone} Secure: ${res.hasSecure}`);
      if (res.hasSameSiteNone && res.hasSecure) {
        console.log('Desired cookie flags present. Attempting login test...');
        const loginRes = await attemptLogin(API, EMAIL, PASSWORD);
        if (loginRes.ok) {
          console.log('Login test succeeded:', loginRes);
          process.exit(0);
        } else {
          console.log('Login test failed:', loginRes);
          // Provide helpful debug info when login fails despite correct cookie flags
          console.log('Debug: csrf response cookies:', res.cookies);
          console.log('Debug: csrf response body (text):', res.tokenBodyText);
          console.log('Debug: csrf token sent in login attempt:', loginRes.csrfTokenSent || '(none)');
          process.exit(2);
        }
      } else {
        console.log('Cookie flags not yet set. Response cookies and token body will be logged for debugging.');
        console.log('Cookies:', res.cookies);
        console.log('csrf response body (text):', res.tokenBodyText);
      }
    }
    await wait(INTERVAL);
  }
  console.log('\nTimeout reached; cookie flags not updated.');
  process.exit(3);
}

run().catch(e => { console.error(e && (e.stack || e)); process.exit(1); });
