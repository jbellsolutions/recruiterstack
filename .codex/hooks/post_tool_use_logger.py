#!/usr/bin/env python3
import json
import os
from datetime import datetime, timezone
from pathlib import Path


def parse_response(payload):
    response = payload.get("tool_response")
    if isinstance(response, str):
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"output": response}
    if isinstance(response, dict):
        return response
    return {}


def append_jsonl(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record) + "\n")


def main() -> None:
    payload = json.load(os.fdopen(0))
    cwd = Path(payload.get("cwd") or ".")
    state_root = cwd / ".agents" / "agi-codex"
    response = parse_response(payload)
    exit_code = response.get("exit_code")
    if exit_code is None:
        exit_code = response.get("exitCode")
    if not exit_code:
        return

    command = ((payload.get("tool_input") or {}).get("command")) or ""
    output = response.get("stderr") or response.get("output") or ""
    output = output[:500]
    timestamp = datetime.now(timezone.utc).isoformat()

    append_jsonl(
        state_root / "learning" / "observations.jsonl",
        {
            "type": "bash_failure",
            "command": command,
            "exit_code": exit_code,
            "evidence": output,
            "timestamp": timestamp,
        },
    )
    append_jsonl(
        state_root / "healing" / "history.jsonl",
        {
            "status": "observed",
            "command": command,
            "exit_code": exit_code,
            "error_excerpt": output,
            "timestamp": timestamp,
        },
    )

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": "The last Bash command failed and was logged to AGI-Codex observations.",
                }
            }
        )
    )


if __name__ == "__main__":
    main()
