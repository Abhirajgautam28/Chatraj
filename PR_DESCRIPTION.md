Title: Add dev run script, CI smoke-tests, and lightweight E2E

Summary:
This PR adds developer convenience scripts to run backend and frontend together, a GitHub Actions workflow to run smoke-tests on pull requests, and lightweight E2E scripts for local validation. It also documents root causes and fixes for production 404s (frontend calling endpoints without `/api` prefix) and runtime axios baseURL issues.

Files changed:
- `package.json` (root) - added `dev`, convenience scripts, and `smoke-test` scripts
- `.github/workflows/smoke-test.yml` - new workflow to run smoke-test on PRs
- `Backend/scripts/e2e-test.js` - lightweight E2E for local checks
- `Backend/scripts/smoke-test.js` - existing smoke-test (unchanged)
- `README_DEV.md` - documentation and guidance

Testing:
- I started the backend locally and validated `/health` returns 200.
- Ran `node Backend/scripts/smoke-test.js` and `node Backend/scripts/e2e-test.js` — both passed locally.

Notes for reviewers:
- If CI requires access to MongoDB/SMS, add the required Secrets: `MONGODB_URI`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
- This PR intentionally avoids touching unrelated app logic; frontend changes to fix `/api` usage and axios fallback are assumed to be applied in previous commits in this branch.

How to add the required repository Secrets: Go to `Settings` → `Secrets and variables` → `Actions` in your GitHub repository and add each secret (see `README_DEV.md` for step-by-step instructions). Do NOT commit secrets into source control.
