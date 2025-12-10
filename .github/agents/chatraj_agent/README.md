# Chatraj Agent

Lightweight Python agent to assist with common maintenance tasks for the Chatraj repo.

Usage

Install (optional):

```powershell
python -m pip install -r .github/agents/chatraj_agent/requirements.txt
```

Run via Python:

```powershell
python -m .github.agents.chatraj_agent.agent scan
python -m .github.agents.chatraj_agent.agent backend-test
python -m .github.agents.chatraj_agent.agent generate-frontend-sitemap
```

Or use as a module: `from .github.agents.chatraj_agent import agent`

GitHub Actions

This repo includes a workflow `.github/workflows/chatraj-agent.yml` to run the agent in CI. See `DEPLOY.md` for deployment and secrets configuration.

Deployment and running details are in `DEPLOY.md`.
