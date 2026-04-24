---
name: "agi-codex-main"
description: "Main AGI-Codex orchestrator for Codex-native audit, review, learning, and sync workflows."
---

# AGI-Codex Main

Use this skill when a repo already has AGI-Codex scaffolding or when the user
asks for a full Codex-native reinforcement pass.

## Workflow

1. Read root `AGENTS.md`, `.codex/config.toml`, `.codex/hooks.json`, and
   `.agents/agi-codex/baseline.json` if present.
2. Run the audit skill to establish or refresh a baseline.
3. Review repo state and route into the council skill if the request is about
   architecture, readiness, or system gaps.
4. Route into the learn skill if there are repeated failures or stale
   observations.
5. Route into the sync skill when promotion candidates are ready or the user
   asks to inspect local genome state.

## Guardrails

- Keep required rules in checked-in files.
- Treat Memories as recall only.
- Prefer local-first changes unless the user explicitly wants sync or sharing.
