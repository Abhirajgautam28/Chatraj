#!/usr/bin/env node
// Script: set_render_env.js
// Purpose: create or update an environment variable for a Render service
// Usage (from GH Action): provide RENDER_API_KEY, SERVICE_ID, ENV_KEY, ENV_VALUE

(async () => {
  try {
    const apiKey = process.env.RENDER_API_KEY;
    const serviceId = process.env.SERVICE_ID;
    const key = process.env.ENV_KEY || 'CSRF_SIGNING_SECRET';
    const value = process.env.ENV_VALUE;

    if (!apiKey || !serviceId || !value) {
      console.error('Missing required env vars. Set RENDER_API_KEY, SERVICE_ID, and ENV_VALUE.');
      process.exit(1);
    }

    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    const listUrl = `https://api.render.com/v1/services/${serviceId}/env-vars`;

    const listResp = await fetch(listUrl, { headers });
    if (!listResp.ok) {
      const body = await listResp.text().catch(() => '<no body>');
      console.error('Failed to list env vars:', listResp.status, body);
      process.exit(1);
    }

    const list = await listResp.json();
    const existing = Array.isArray(list) ? list.find(e => e.key === key) : null;

    if (existing && existing.id) {
      const updateUrl = `https://api.render.com/v1/services/${serviceId}/env-vars/${existing.id}`;
      const updateResp = await fetch(updateUrl, { method: 'PATCH', headers, body: JSON.stringify({ value, secure: true }) });
      if (!updateResp.ok) {
        const body = await updateResp.text().catch(() => '<no body>');
        console.error('Failed to update env var:', updateResp.status, body);
        process.exit(1);
      }
      console.log('Updated env var', key);
      process.exit(0);
    }

    // Create
    const createResp = await fetch(listUrl, { method: 'POST', headers, body: JSON.stringify({ key, value, secure: true }) });
    if (!createResp.ok) {
      const body = await createResp.text().catch(() => '<no body>');
      console.error('Failed to create env var:', createResp.status, body);
      process.exit(1);
    }
    console.log('Created env var', key);
    process.exit(0);
  } catch (err) {
    console.error('Error setting env var:', err && (err.stack || err.message || String(err)));
    process.exit(1);
  }
})();
