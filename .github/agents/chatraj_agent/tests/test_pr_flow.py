import os
from chatraj_agent.agent import ChatrajAgent


def test_create_branch_requires_token():
    env_token = os.environ.pop("GITHUB_TOKEN", None)
    agent = ChatrajAgent(repo_root=".")
    try:
        try:
            agent.create_branch_with_changes(
                "test-branch", {"foo.txt": "hello"}, repo="owner/repo")
            assert False, "Expected EnvironmentError when GITHUB_TOKEN unset"
        except EnvironmentError:
            pass
    finally:
        if env_token is not None:
            os.environ["GITHUB_TOKEN"] = env_token
