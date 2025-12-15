# Deploying and Running the Chatraj Agent

This document explains how to run the Chatraj agent locally and in GitHub Actions, and which environment variables and permissions are required.

Prerequisites

- Python 3.10+ installed on the runner (CI uses 3.11 in the workflow)

- Node.js and npm installed if you want the agent to invoke frontend/backend npm scripts

- (Optional) `git` configured for operations that infer the repository

Required environment variables

- `GITHUB_TOKEN` — a personal access token (or Actions-provided `secrets.GITHUB_TOKEN`) used for creating issues, PRs and comments. Scopes: `repo` for private repos; `public_repo` for public repos.

- `MONGODB_URI` — required only if you run backend scripts that connect to the project's database (e.g., `populate-slugs`, `generate-sitemap`).

Local usage

1. Install Python deps (optional but recommended):

```powershell
python -m pip install --upgrade pip
python -m pip install -r .github/agents/chatraj_agent/requirements.txt
```

2. Run the agent CLI (examples):

```powershell
# scan repository
python -m .github.agents.chatraj_agent.agent scan

# run unit tests for the codebase agent
python -m .github.agents.chatraj_agent.agent backend-test

# generate frontend sitemap (requires node/npm and scripts present)
python -m .github.agents.chatraj_agent.agent generate-frontend-sitemap

# populate blog slugs (requires MONGODB_URI in env)
python -m .github.agents.chatraj_agent.agent populate-slugs
```

3. If you want the agent to create PRs or comments, export a token first:

```powershell
$env:GITHUB_TOKEN = "ghp_..."
```

CI usage (GitHub Actions)

The included workflow `.github/workflows/chatraj-agent.yml` already runs tests and the agent scan. To enable PR/issue creation from the workflow, rely on the default `secrets.GITHUB_TOKEN` or add a custom token with broader scopes in repository secrets.

Notes and safety

- The agent invokes `npm` scripts that exist in the repo. Ensure `package.json` scripts named `generate-sitemap` and `populate-slugs` are safe to run in CI.

- Database scripts require credentials; do NOT store production credentials in public repositories. Use protected secrets.

- The agent uses a best-effort `git remote` inference to detect `owner/repo`. If it fails, pass `--repo owner/name` into methods that require it.

Support
If you want me to wire the agent to create branches, commit changes, open PRs, and then post a comment with test results automatically, say so and I will add that flow and tests.
