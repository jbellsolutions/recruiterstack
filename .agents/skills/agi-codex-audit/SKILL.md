---
name: "agi-codex-audit"
description: "Audit a repo for Codex-native policy, runtime, and learning readiness."
---

# AGI-Codex Audit

Audit the repo against three buckets:

- policy: `AGENTS.md`, override strategy, verification guidance, checked-in docs
- runtime: `.codex/config.toml`, `.codex/hooks.json`, hook handlers, team skills
- learning: `.agents/agi-codex/` state, checkpoints, observations, review logs,
  pending promotions

## Output

Write or refresh `.agents/agi-codex/baseline.json` with:

- `policy`
- `runtime`
- `learning`
- `overall`
- audit timestamp
- iteration record

Scores can be simple integers from 0-100 per category in v1. The important
thing is consistency and evidence, not fake precision.
