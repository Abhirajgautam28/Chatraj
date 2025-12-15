import sys
from pathlib import Path

# Ensure the chatraj_agent package is importable during tests
# add the parent directory that contains `chatraj_agent`
PACKAGE_PARENT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PACKAGE_PARENT))
