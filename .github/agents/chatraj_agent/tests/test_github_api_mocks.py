import os
import json
import types
import pytest

from chatraj_agent.agent import ChatrajAgent


class DummyResp:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json = json_data or {}

    def json(self):
        return self._json


def test_create_pr_and_branch_flow(monkeypatch, tmp_path):
    # Provide a fake token to skip token checks
    os.environ["GITHUB_TOKEN"] = "ghp_testtoken"
    agent = ChatrajAgent(repo_root=str(tmp_path))

    calls = {}

    def fake_get(url, headers=None):
        # base ref
        return DummyResp(200, {"object": {"sha": "base-sha"}})

    def fake_post(url, json=None, headers=None):
        calls.setdefault('posts', []).append((url, json))
        # blob creation
        if url.endswith('/git/blobs'):
            return DummyResp(201, {"sha": "blob-sha"})
        if url.endswith('/git/trees'):
            return DummyResp(201, {"sha": "tree-sha"})
        if url.endswith('/git/commits'):
            return DummyResp(201, {"sha": "commit-sha"})
        if url.endswith('/git/refs'):
            return DummyResp(201, {"ref": "refs/heads/test-branch"})
        if url.endswith('/pulls'):
            return DummyResp(201, {"html_url": "https://example.com/pr/1"})
        return DummyResp(200, {})

    monkeypatch.setattr("requests.get", fake_get)
    monkeypatch.setattr("requests.post", fake_post)

    # Run create_branch_with_changes (should use patched requests)
    ref = agent.create_branch_with_changes(
        "test-branch", {"foo.txt": "hello"}, repo="owner/repo")
    assert isinstance(ref, dict) or ref is not None

    pr = agent.create_pull_request(
        "title", head="test-branch", repo="owner/repo")
    assert pr.get("html_url") == "https://example.com/pr/1"
