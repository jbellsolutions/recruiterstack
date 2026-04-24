#!/usr/bin/env python3
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path


def git_output(cwd: Path, *args: str) -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=cwd,
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return ""
        return result.stdout.strip()
    except FileNotFoundError:
        return ""


def summarize_message(message: str):
    lines = [line.strip("- ").strip() for line in message.splitlines() if line.strip()]
    bullets = [line for line in lines if len(line) > 4][:5]
    return bullets


def main() -> None:
    payload = json.load(os.fdopen(0))
    cwd = Path(payload.get("cwd") or ".")
    checkpoint_path = cwd / ".agents" / "agi-codex" / "checkpoints" / "latest.json"
    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)

    previous = {}
    if checkpoint_path.exists():
        try:
            previous = json.loads(checkpoint_path.read_text())
        except json.JSONDecodeError:
            previous = {}

    message = payload.get("last_assistant_message") or ""
    bullets = summarize_message(message)
    branch = git_output(cwd, "branch", "--show-current")
    head = git_output(cwd, "rev-parse", "--short", "HEAD")
    dirty = git_output(cwd, "status", "--short").splitlines()
    changed_files = [line[3:] for line in dirty if len(line) > 3]

    checkpoint = {
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "intent": previous.get("intent") or (bullets[0] if bullets else ""),
        "decisions": bullets[1:3],
        "files_modified": changed_files[:10],
        "next_steps": bullets[3:5],
        "summary_excerpt": message[:280],
        "git_status": {
            "branch": branch,
            "head": head,
            "dirty_files": len(changed_files),
        },
    }
    checkpoint_path.write_text(json.dumps(checkpoint, indent=2) + "\n")
    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()
