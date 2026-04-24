#!/usr/bin/env python3
import json
import os
from pathlib import Path


def main() -> None:
    payload = json.load(os.fdopen(0))
    cwd = Path(payload.get("cwd") or ".")
    prompt = payload.get("prompt") or ""
    lines = []

    if not (cwd / "AGENTS.md").exists():
        lines.append("This repo is missing AGENTS.md. Consider bootstrapping AGI-Codex before making wide changes.")

    if "review" in prompt.lower() and not (cwd / ".agents" / "agi-codex" / "baseline.json").exists():
        lines.append("No AGI-Codex baseline exists yet. Capture one before relying on historical scores.")

    if not lines:
        return

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": "\n".join(lines),
                }
            }
        )
    )


if __name__ == "__main__":
    main()
