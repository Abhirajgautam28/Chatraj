import os
from chatraj_agent.agent import ChatrajAgent


def test_scan_repo_counts(tmp_path):
    # create a small repo structure
    (tmp_path / "subdir").mkdir()
    f1 = tmp_path / "a.txt"
    f1.write_text("hello")
    f2 = tmp_path / "subdir" / "b.txt"
    f2.write_text("world")

    agent = ChatrajAgent(repo_root=str(tmp_path))
    summary = agent.scan_repo()
    assert summary["files"] >= 2
    assert summary["dirs"] >= 1


def test_create_issue_requires_token():
    # ensure missing token raises
    env_token = os.environ.pop("GITHUB_TOKEN", None)
    agent = ChatrajAgent(repo_root=".")
    try:
        try:
            agent.create_github_issue("t", "b", repo="owner/repo")
            assert False, "Expected EnvironmentError when GITHUB_TOKEN unset"
        except EnvironmentError:
            pass
        try:
            agent.create_pull_request("t", "headbranch", repo="owner/repo")
            assert False, "Expected EnvironmentError when GITHUB_TOKEN unset"
        except EnvironmentError:
            pass
    finally:
        if env_token is not None:
            os.environ["GITHUB_TOKEN"] = env_token
