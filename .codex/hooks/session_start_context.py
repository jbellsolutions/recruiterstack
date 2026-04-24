#!/usr/bin/env python3
import json
import os
from pathlib import Path


def load_json(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return None


def main() -> None:
    payload = json.load(os.fdopen(0))
    cwd = Path(payload.get("cwd") or ".")
    state_root = cwd / ".agents" / "agi-codex"
    checkpoint = load_json(state_root / "checkpoints" / "latest.json") or {}
    baseline = load_json(state_root / "baseline.json") or {}

    lines = []
    if checkpoint:
        intent = checkpoint.get("intent") or checkpoint.get("summary_excerpt")
        next_steps = checkpoint.get("next_steps") or []
        if intent:
            lines.append(f"Last checkpoint intent: {intent}")
        if next_steps:
            lines.append("Next steps: " + "; ".join(next_steps[:3]))

    scores = (baseline.get("scores") or {})
    if scores.get("overall") is not None:
        lines.append(
            "Baseline score: "
            f"{scores.get('overall')} "
            f"(policy={scores.get('policy')}, runtime={scores.get('runtime')}, learning={scores.get('learning')})"
        )

    if not lines:
        return

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": "\n".join(lines),
                }
            }
        )
    )


if __name__ == "__main__":
    main()
