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
