import os
import json
from types import SimpleNamespace

import pytest

from chatraj_agent import auto_pr


class DummyCollection:
    def __init__(self, docs):
        self._docs = docs

    def find(self, *args, **kwargs):
        for d in self._docs:
            yield d


class DummyDB:
    def __init__(self, docs):
        self._docs = docs

    def get_collection(self, name):
        assert name == "blogs"
        return DummyCollection(self._docs)


class DummyClient:
    def __init__(self, docs):
        self._docs = docs

    def get_default_database(self):
        return DummyDB(self._docs)


def test_auto_pr_skips_without_mongo_env(monkeypatch, capsys):
    monkeypatch.delenv("MONGODB_URI", raising=False)
    monkeypatch.setattr(auto_pr, "MongoClient", None)
    result = auto_pr.main()
    assert result in (0, 2)


def test_auto_pr_detects_missing_slugs(monkeypatch, tmp_path):
    docs = [{"_id": 1, "title": "Hello World"}, {"_id": 2, "title": "No Slug"}]
    monkeypatch.setenv("MONGODB_URI", "mongodb://fake")
    monkeypatch.setattr(auto_pr, "MongoClient", lambda uri,
                        serverSelectionTimeoutMS=5000: DummyClient(docs))
    # prevent actual GitHub calls by mocking ChatrajAgent methods

    class DummyAgent:
        def create_branch_with_changes(self, branch, files, commit_message=None):
            assert "/auto_populate_slugs.json" in files
            return {"ref": f"refs/heads/{branch}"}

        def create_pull_request(self, title, head, base, body=None):
            return {"html_url": "https://example.com/pr/1"}

    monkeypatch.setattr(auto_pr, "ChatrajAgent", lambda: DummyAgent())

    res = auto_pr.main()
    assert res == 0
