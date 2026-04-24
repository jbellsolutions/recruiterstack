---
name: "agi-codex-council"
description: "Run a Codex-native council pass using multi-agent review when available and a serial fallback otherwise."
---

# AGI-Codex Council

Use this skill for design, architecture, readiness, and workflow critique.

## Specialists

- policy reviewer
- runtime reviewer
- learning/reinforcement reviewer

## Execution

If multi-agent tools are available and appropriate:

1. Spawn parallel reviewers with disjoint scopes.
2. Ask each reviewer for evidence-backed findings only.
3. Merge the findings into one synthesized report.

If not:

1. Run the same three reviewer passes serially.
2. Keep the output shape identical to the multi-agent path.

## Deliverable

Write a synthesized JSON report under `.agents/agi-codex/review/` and summarize:

- critical gaps
- medium gaps
- what should be fixed now
- what should stay local-only for now
