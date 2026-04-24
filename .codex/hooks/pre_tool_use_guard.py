#!/usr/bin/env python3
import json
import os
import re


DESTRUCTIVE_PATTERNS = [
    (re.compile(r"\brm\s+-rf\s+/"), "Refusing to run `rm -rf /`."),
    (re.compile(r"\bgit\s+reset\s+--hard\b"), "Refusing hard git reset from AGI-Codex policy."),
    (re.compile(r"\bgit\s+clean\s+-fd"), "Refusing destructive git clean from AGI-Codex policy."),
    (re.compile(r"\bDROP\s+TABLE\b", re.IGNORECASE), "Refusing SQL DROP TABLE from AGI-Codex policy."),
    (re.compile(r"\bTRUNCATE\s+TABLE\b", re.IGNORECASE), "Refusing SQL TRUNCATE TABLE from AGI-Codex policy."),
]

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
]


def deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "systemMessage": reason,
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                },
            }
        )
    )


def main() -> None:
    payload = json.load(os.fdopen(0))
    command = ((payload.get("tool_input") or {}).get("command")) or ""

    for pattern, reason in DESTRUCTIVE_PATTERNS:
        if pattern.search(command):
            deny(reason)
            return

    for pattern in SECRET_PATTERNS:
        if pattern.search(command):
            deny("Refusing to run a command that appears to contain a secret.")
            return


if __name__ == "__main__":
    main()
