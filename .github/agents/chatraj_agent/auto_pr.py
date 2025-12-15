import os
import sys
from pathlib import Path

from .agent import ChatrajAgent
from typing import Dict

try:
    from pymongo import MongoClient
except Exception:
    MongoClient = None


def main():
    # Safety gate: only run when enabled via env
    enable = os.environ.get("AUTO_PR_ENABLE", "false").lower() == "true"
    if not enable:
        print("AUTO_PR_ENABLE not true; skipping automated PR flow.")
        return 0

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("GITHUB_TOKEN not set; cannot create PR")
        return 2

    agent = ChatrajAgent()

    branch = "automated/add-agent-config"
    # files to add in PR
    files: Dict[str, str] = {
        ".github/ISSUE_TEMPLATE/automated_issue.md": Path(".github/ISSUE_TEMPLATE/automated_issue.md").read_text() if Path(".github/ISSUE_TEMPLATE/automated_issue.md").exists() else "# Automated Issue Template",
        ".github/agents/agent.config.yml": "enabled: true\nsource: chatraj-agent\n",
    }

    # Optional: detect missing blog slugs via MongoDB and add a JSON mapping file to the PR
    mongodb_uri = os.environ.get("MONGODB_URI")
    if mongodb_uri and MongoClient is not None:
        try:
            client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            db = client.get_default_database()
            blogs = db.get_collection("blogs")
            missing = []
            for doc in blogs.find({"$or": [{"slug": {"$exists": False}}, {"slug": None}]}, {"_id": 1, "title": 1}):
                _id = str(doc.get("_id"))
                title = doc.get("title") or ""
                # simple slugify
                slug = title.lower().strip().replace(" ", "-")
                slug = ''.join(ch for ch in slug if (
                    ch.isalnum() or ch == '-'))
                missing.append({"_id": _id, "title": title, "slug": slug})
            if missing:
                import json

                mapping_path = "Backend/scripts/auto_populate_slugs.json"
                files[mapping_path] = json.dumps(missing, indent=2)
                print(
                    f"Found {len(missing)} blogs missing slugs; added {mapping_path} to PR files.")
            else:
                print("No blogs missing slugs detected in DB.")
        except Exception as e:
            print("MongoDB check failed:", e)
    else:
        if mongodb_uri and MongoClient is None:
            print("pymongo not available; cannot check MongoDB.")
        else:
            print("MONGODB_URI not set; skipping DB slug detection.")

    print("Creating branch and committing files via GitHub API...")
    try:
        ref = agent.create_branch_with_changes(
            branch, files, commit_message="chore(agent): add automated issue template and agent config")
        print("Created branch:", ref.get("ref")
              if isinstance(ref, dict) else ref)
    except Exception as e:
        print("Failed to create branch:", e)
        return 3

    try:
        pr_body_lines = [
            "Adds agent config and issue template.",
            "",
            "---",
            "This PR was created automatically by the Chatraj agent.",
        ]
        mapping_path = "Backend/scripts/auto_populate_slugs.json"
        if mapping_path in files:
            pr_body_lines += [
                "",
                "Detected missing blog slugs and included a mapping file:",
                f"- `{mapping_path}`",
                "",
                "To apply these mappings after PR merge, run the backend apply script on the server or locally (requires `MONGODB_URI`):",
                "",
                "```powershell",
                "# on the server or local machine with access to the DB",
                "$env:MONGODB_URI = \"<your_mongodb_uri>\";",
                "cd Backend/scripts;",
                "node apply-slugs-from-json.mjs ../auto_populate_slugs.json",
                "```",
                "",
                "Alternatively, you can merge this PR and then run the `Backend/scripts/apply-slugs-from-json.mjs` script in CI with a protected secret for `MONGODB_URI`.",
            ]

        pr_body = "\n".join(pr_body_lines)

        pr = agent.create_pull_request("chore(agent): add automated issue template and config",
                                       head=branch, base="main", body=pr_body)
        print("Created PR:", pr.get("html_url"))
    except Exception as e:
        print("Failed to create PR:", e)
        return 4

    return 0


if __name__ == "__main__":
    sys.exit(main())
