import argparse


def build_parser():
    p = argparse.ArgumentParser(
        prog="chatraj-agent", description="Chatraj project management agent")
    sub = p.add_subparsers(dest="command")

    sub.add_parser("scan", help="Scan repository and print file/dir counts")
    sub.add_parser(
        "backend-test", help="Run Backend tests (npm test in Backend)")
    sub.add_parser("frontend-test",
                   help="Run frontend tests (npm test in frontend)")
    sub.add_parser("generate-frontend-sitemap",
                   help="Run frontend sitemap generator script")
    sub.add_parser("populate-slugs", help="Run backend slug population script")
    sub.add_parser("generate-backend-sitemap",
                   help="Run backend sitemap generator script")

    ci = sub.add_parser(
        "create-issue", help="Create a GitHub issue (requires GITHUB_TOKEN)")
    ci.add_argument("--title", required=True)
    ci.add_argument("--body", required=True)
    ci.add_argument("--repo", required=False,
                    help="owner/repo (if not provided, inferred from git remote)")

    return p
