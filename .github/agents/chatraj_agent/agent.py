import os
import subprocess
import sys
import json
from typing import Optional
from typing import Dict


class ChatrajAgent:
    """Lightweight Python agent to perform common project operations."""

    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = repo_root or os.path.abspath(os.getcwd())

    def run_command(self, command: str, cwd: Optional[str] = None, check: bool = True):
        cwd = cwd or self.repo_root
        print(f"Running: {command} (cwd={cwd})")
        result = subprocess.run(command, shell=True, cwd=cwd)
        if check and result.returncode != 0:
            raise RuntimeError(
                f"Command failed ({result.returncode}): {command}")
        return result.returncode

    def scan_repo(self):
        summary = {"files": 0, "dirs": 0}
        for root, dirs, files in os.walk(self.repo_root):
            summary["dirs"] += len(dirs)
            summary["files"] += len(files)
        print(json.dumps(summary, indent=2))
        return summary

    def run_backend_tests(self):
        backend_dir = os.path.join(self.repo_root, "Backend")
        if not os.path.isdir(backend_dir):
            raise FileNotFoundError("Backend directory not found")
        return self.run_command("npm test", cwd=backend_dir)

    def run_frontend_tests(self):
        frontend_dir = os.path.join(self.repo_root, "frontend")
        if not os.path.isdir(frontend_dir):
            raise FileNotFoundError("frontend directory not found")
        return self.run_command("npm test", cwd=frontend_dir)

    def generate_frontend_sitemap(self):
        frontend_dir = os.path.join(self.repo_root, "frontend")
        if not os.path.isdir(frontend_dir):
            raise FileNotFoundError("frontend directory not found")
        # Use npm script if available
        return self.run_command("npm run generate-sitemap", cwd=frontend_dir)

    def populate_blog_slugs(self):
        backend_dir = os.path.join(self.repo_root, "Backend")
        if not os.path.isdir(backend_dir):
            raise FileNotFoundError("Backend directory not found")
        return self.run_command("npm run populate-slugs", cwd=backend_dir)

    def generate_backend_sitemap(self):
        backend_dir = os.path.join(self.repo_root, "Backend")
        if not os.path.isdir(backend_dir):
            raise FileNotFoundError("Backend directory not found")
        return self.run_command("npm run generate-sitemap", cwd=backend_dir)

    def create_github_issue(self, title: str, body: str, repo: Optional[str] = None):
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            raise EnvironmentError("GITHUB_TOKEN not set in environment")
        if not repo:
            # try to infer from git remote
            repo = self._infer_github_repo()
        import requests

        url = f"https://api.github.com/repos/{repo}/issues"
        payload = {"title": title, "body": body}
        headers = {"Authorization": f"token {token}",
                   "Accept": "application/vnd.github.v3+json"}
        resp = requests.post(url, json=payload, headers=headers)
        if resp.status_code not in (200, 201):
            raise RuntimeError(
                f"Failed to create issue: {resp.status_code} {resp.text}")
        print("Issue created:", resp.json().get("html_url"))
        return resp.json()

    def _retry_request(self, func, max_attempts: int = 3, backoff: float = 0.5):
        attempt = 0
        while attempt < max_attempts:
            try:
                return func()
            except Exception:
                attempt += 1
                if attempt >= max_attempts:
                    raise
                import time

                time.sleep(backoff * (2 ** (attempt - 1)))

    def create_pull_request(self, title: str, head: str, base: str = "main", body: str = "", repo: Optional[str] = None):
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            raise EnvironmentError("GITHUB_TOKEN not set in environment")
        if not repo:
            repo = self._infer_github_repo()
        import requests

        url = f"https://api.github.com/repos/{repo}/pulls"
        payload = {"title": title, "head": head, "base": base, "body": body}
        headers = {"Authorization": f"token {token}",
                   "Accept": "application/vnd.github.v3+json"}

        def do_post():
            resp = requests.post(url, json=payload, headers=headers)
            if resp.status_code not in (200, 201):
                raise RuntimeError(
                    f"Failed to create PR: {resp.status_code} {resp.text}")
            return resp.json()

        return self._retry_request(do_post)

    def comment_on_pull_request(self, pr_number: int, comment: str, repo: Optional[str] = None):
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            raise EnvironmentError("GITHUB_TOKEN not set in environment")
        if not repo:
            repo = self._infer_github_repo()
        import requests

        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
        payload = {"body": comment}
        headers = {"Authorization": f"token {token}",
                   "Accept": "application/vnd.github.v3+json"}

        def do_post():
            resp = requests.post(url, json=payload, headers=headers)
            if resp.status_code not in (200, 201):
                raise RuntimeError(
                    f"Failed to comment on PR: {resp.status_code} {resp.text}")
            return resp.json()

        return self._retry_request(do_post)

    def create_branch_with_changes(self, branch: str, files: Dict[str, str], commit_message: str = "chore: automated changes", base: str = "main", repo: Optional[str] = None):
        """Create a new branch from `base`, commit `files` (path->content), and return the new branch ref JSON.

        Uses the GitHub REST API to create blobs, a tree, a commit and a ref.
        """
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            raise EnvironmentError("GITHUB_TOKEN not set in environment")
        if not repo:
            repo = self._infer_github_repo()
        import requests

        api = f"https://api.github.com/repos/{repo}"

        def get_base():
            r = requests.get(f"{api}/git/ref/heads/{base}",
                             headers={"Authorization": f"token {token}"})
            if r.status_code != 200:
                raise RuntimeError(
                    f"Failed to get base ref: {r.status_code} {r.text}")
            return r.json()["object"]["sha"]

        base_sha = self._retry_request(get_base)

        blob_shas = {}
        for path, content in files.items():
            def make_blob(path=path, content=content):
                r = requests.post(f"{api}/git/blobs", json={"content": content,
                                  "encoding": "utf-8"}, headers={"Authorization": f"token {token}"})
                if r.status_code not in (200, 201):
                    raise RuntimeError(
                        f"Failed to create blob for {path}: {r.status_code} {r.text}")
                return r.json()["sha"]

            blob_shas[path] = self._retry_request(make_blob)

        tree = []
        for path, sha in blob_shas.items():
            tree.append({"path": path.replace('\\', '/'),
                        "mode": "100644", "type": "blob", "sha": sha})

        def create_tree():
            r = requests.post(f"{api}/git/trees", json={"tree": tree,
                              "base_tree": base_sha}, headers={"Authorization": f"token {token}"})
            if r.status_code not in (200, 201):
                raise RuntimeError(
                    f"Failed to create tree: {r.status_code} {r.text}")
            return r.json()["sha"]

        tree_sha = self._retry_request(create_tree)

        def create_commit():
            r = requests.post(f"{api}/git/commits", json={"message": commit_message, "tree": tree_sha,
                              "parents": [base_sha]}, headers={"Authorization": f"token {token}"})
            if r.status_code not in (200, 201):
                raise RuntimeError(
                    f"Failed to create commit: {r.status_code} {r.text}")
            return r.json()["sha"]

        commit_sha = self._retry_request(create_commit)

        def create_ref():
            r = requests.post(f"{api}/git/refs", json={"ref": f"refs/heads/{branch}",
                              "sha": commit_sha}, headers={"Authorization": f"token {token}"})
            if r.status_code not in (200, 201):
                raise RuntimeError(
                    f"Failed to create ref: {r.status_code} {r.text}")
            return r.json()

        ref = self._retry_request(create_ref)
        return ref

    def _infer_github_repo(self) -> str:
        # best-effort: read git remote origin
        try:
            out = subprocess.check_output(
                "git remote get-url origin", shell=True, cwd=self.repo_root, text=True).strip()
        except Exception:
            raise RuntimeError(
                "Could not infer repo; please pass repo='owner/name' or set git remote 'origin'")
        # parse URL formats
        if out.startswith("git@"):  # git@github.com:owner/repo.git
            out = out.split(":", 1)[1]
        out = out.replace("https://github.com/", "").replace("/", "/")
        out = out.rstrip(".git")
        return out


def main(argv=None):
    argv = argv or sys.argv[1:]
    from .cli import build_parser

    parser = build_parser()
    args = parser.parse_args(argv)
    agent = ChatrajAgent()

    if args.command == "scan":
        agent.scan_repo()
    elif args.command == "backend-test":
        agent.run_backend_tests()
    elif args.command == "frontend-test":
        agent.run_frontend_tests()
    elif args.command == "generate-frontend-sitemap":
        agent.generate_frontend_sitemap()
    elif args.command == "populate-slugs":
        agent.populate_blog_slugs()
    elif args.command == "generate-backend-sitemap":
        agent.generate_backend_sitemap()
    elif args.command == "create-issue":
        agent.create_github_issue(args.title, args.body, repo=args.repo)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
