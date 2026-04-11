Production checklist for ChatRaj

1) Environment variables
- Set the variables from `Backend/.env.example` in your backend host (Render/other).
- Set the variables from `frontend/.env.example` in Vercel (Project → Settings → Environment Variables).

2) Cookies & CSRF
- Backend runs with `csurf({ cookie: true })` and sets cookies with `secure` when NODE_ENV=production and `SameSite=None` for cross-site cookies.
- Ensure backend is served over HTTPS so cookies with `secure` are accepted by browsers.

3) CORS
- The backend allows origins listed in `app.js` and any `*.vercel.app`. If your Vercel domain differs, add it to `allowedOrigins` or ensure `origin` matches the runtime host.

4) DNS SRV fallback
- We added an optional `MONGODB_DNS_SERVERS` env to override SRV resolver; for locked-down networks, set it to your permitted DNS servers.

5) Build & Deploy
- Build frontend locally for verification: `cd frontend && npm install && npm run build`.
- Backend: ensure `MONGODB_URI`, `JWT_SECRET`, `REDIS_URL`, and SMTP vars are set in your host.

6) Verification
- After deployment, test login, register, and project chat flows. The app uses `XSRF-TOKEN` and an explicit `/csrf-token` endpoint to support cross-origin setups.

7) Optional
- Remove secrets from local repo and use `Backend/.env.example` and `frontend/.env.example` in the repo. Use secret management in your host.
