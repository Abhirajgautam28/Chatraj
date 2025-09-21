# Development README

Quick developer guide for running ChatRaj locally and CI smoke-tests.

## Start both backend and frontend (monorepo)

From the repo root:

```powershell
npm run dev
```

This uses `npx concurrently` to run the Backend server and the Vite dev server.

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

## Run smoke or E2E checks locally

- Smoke-test:

```powershell
node Backend/scripts/smoke-test.js
```

- Lightweight E2E (register + public endpoints):

```powershell
node Backend/scripts/e2e-test.js
```

## CI

A GitHub Actions workflow `.github/workflows/smoke-test.yml` runs the smoke-test on pull requests against `main`. If your app requires secrets (e.g. `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`) set them in the repository Secrets and update the workflow to export them before starting the backend.

## Root cause and fixes applied

Root cause summary:
- The frontend used relative API endpoints without the `/api` prefix which caused 404s in production when the backend routers were mounted under `/api/*`.
- The frontend axios instance sometimes resolved to the frontend origin when `VITE_API_URL` was not available, causing calls to go to the frontend host instead of the backend.
- Local developer env had stray Node/Vite processes which led to intermittent `ECONNREFUSED` when starting the backend.

Fixes applied:
- Updated frontend code to call the backend endpoints with the `/api/*` prefix.
- Added a robust runtime fallback in `frontend/src/config/axios.js` (prefer `VITE_API_URL`, otherwise `http://localhost:8080`) to avoid incorrect baseURL resolution.
- Added `Backend/scripts/smoke-test.js` and `Backend/scripts/e2e-test.js` to automate health and lightweight E2E checks.
- Added a root `dev` script (and convenience scripts) using `npx concurrently` to start backend and frontend together.
- Added `.github/workflows/smoke-test.yml` to run smoke tests on PRs with guidance on required secrets.

## What to do if you see errors
- If you see `ECONNREFUSED`, ensure the backend is running (`node Backend/server.js`) and that no other process is binding port 8080.
- If CI fails due to missing DB or SMTP credentials, add the required secrets to repository Settings -> Secrets and update the workflow if you need additional env vars.

## Next steps / optional improvements
- Add Mailtrap or test SMTP in CI to verify OTP flows end-to-end.
- Add an integration test that reads OTP directly from DB in a test-only environment to fully automate registration verification.
- Harden DB reconnection to halt CI runs if DB is permanently unreachable.
