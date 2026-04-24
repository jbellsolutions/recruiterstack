---
name: "agi-codex-bootstrap"
description: "Bootstrap AGI-Codex into a repository using Codex-native config, hooks, and repo state."
---

# AGI-Codex Bootstrap

Use this skill when a repo needs Codex-native reinforcement scaffolding.

## Steps

1. Confirm the repo is not the framework itself.
2. Run `./setup --repo-path <repo>` from the framework root, or describe the
   exact equivalent changes if the setup script is unavailable.
3. Verify these files exist after bootstrap:
   - `AGENTS.md`
   - `.codex/config.toml`
   - `.codex/hooks.json`
   - `.codex/hooks/*.py`
   - `.agents/agi-codex/*`
4. If the user wants teammate inheritance, use `--team`.

## Notes

- Team mode vendors repo-local skill copies into `.agents/skills/`.
- The bootstrap is additive and should not erase existing repo guidance.
