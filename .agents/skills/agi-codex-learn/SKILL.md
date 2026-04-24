---
name: "agi-codex-learn"
description: "Inspect AGI-Codex observations, identify repeated failures, and promote actionable insights into repo state."
---

# AGI-Codex Learn

Use this skill when:

- a failure keeps repeating
- the user asks what the repo has learned
- checkpoint history suggests drift
- observations need pruning or summarizing

## Workflow

1. Read `.agents/agi-codex/learning/observations.jsonl`.
2. Cluster repeated failures by command, file, and error shape.
3. Suggest:
   - a repo-level rule
   - a healing candidate
   - a doc update
   - or an archived observation if it is no longer useful
4. Write results to `learning/insights.json` and `learning/evolution.json`.

Keep v1 conservative. Do not auto-promote weak evidence into the genome.
