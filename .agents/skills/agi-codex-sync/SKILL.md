---
name: "agi-codex-sync"
description: "Inspect the local genome, validate promotion candidates, and prepare local-first or opt-in sync output."
---

# AGI-Codex Sync

This skill manages local-first genome flow.

## Sources

- repo candidates: `.agents/agi-codex/sync/pending-promotions.json`
- global genome: `~/.codex/agi-codex/genome.json`
- sync metadata: `~/.codex/agi-codex/sync.toml`

## Rules

- Never promote without clear evidence
- Keep sync opt-in
- Preserve a changelog entry for every accepted mutation

## v1 behavior

- validate candidate shape
- compare against current genome
- append changelog entries for accepted promotions
- prepare exportable artifacts without requiring a remote service
