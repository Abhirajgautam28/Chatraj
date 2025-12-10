from chatraj_agent.cli import build_parser


def test_cli_has_commands():
    p = build_parser()
    # ensure known commands are present in help
    help_text = p.format_help()
    assert "scan" in help_text
    assert "backend-test" in help_text
    assert "generate-frontend-sitemap" in help_text
