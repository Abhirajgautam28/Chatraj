#!/usr/bin/env node
// Script: set_vercel_env.js
// Purpose: create or update an environment variable for a Vercel project
// Note: Vercel API/versions may change; verify endpoints in Vercel docs if errors occur.

(async () => {
  try {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const key = process.env.ENV_KEY;
    const value = process.env.ENV_VALUE;
    const target = process.env.VERCEL_TARGET || 'production';

    if (!token || !projectId || !key || !value) {
      console.error('Missing required env vars. Set VERCEL_TOKEN, VERCEL_PROJECT_ID, ENV_KEY and ENV_VALUE.');
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const listUrl = `https://api.vercel.com/v9/projects/${projectId}/env`; // v9 is commonly used; update if Vercel docs differ

    // List existing env vars
    const listResp = await fetch(listUrl, { headers });
    if (!listResp.ok) {
      const body = await listResp.text().catch(() => '<no body>');
      console.error('Failed to list Vercel env vars:', listResp.status, body);
      process.exit(1);
    }

    const list = await listResp.json();
    const existing = Array.isArray(list) ? list.find(e => e.key === key) : null;

    if (existing && existing.id) {
      const updateUrl = `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}`;
      const updateResp = await fetch(updateUrl, { method: 'PATCH', headers, body: JSON.stringify({ value, target: [target] }) });
      if (!updateResp.ok) {
        const body = await updateResp.text().catch(() => '<no body>');
        console.error('Failed to update Vercel env var:', updateResp.status, body);
        process.exit(1);
      }
      console.log('Updated Vercel env var', key);
      process.exit(0);
    }

    // Create
    const createResp = await fetch(listUrl, { method: 'POST', headers, body: JSON.stringify({ key, value, target: [target] }) });
    if (!createResp.ok) {
      const body = await createResp.text().catch(() => '<no body>');
      console.error('Failed to create Vercel env var:', createResp.status, body);
      process.exit(1);
    }
    console.log('Created Vercel env var', key);
    process.exit(0);
  } catch (err) {
    console.error('Error setting Vercel env var:', err && (err.stack || err.message || String(err)));
    process.exit(1);
  }
})();
