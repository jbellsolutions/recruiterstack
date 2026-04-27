---
slug: resume-screening
title: Resume Screening
role: Screener
reports_to: head-of-recruiting
default_budget_usd: 50
schedule: on-demand
runtime: claude-code
---

# Resume Screening

**What it does**
Parses incoming resumes, scores candidates against a job's must-haves and nice-to-haves, returns a ranked shortlist with a 2-line rationale per candidate.

**Pain solved**
Screening & Qualification — recruiters spend 6+ hours per req reviewing resumes that don't fit.

**Triggers**
- Webhook from ATS (new application on a req)
- Manual: "screen these 50 resumes against this job"

**Tools required**
- ATS adapter (Bullhorn / Lever / Greenhouse / Crelate)
- Claude API for extraction + scoring

**Outputs**
- Ranked shortlist written back to the ATS with a tag
- Daily digest of top 10 candidates per active req

**Persona prompt (used by Forge)**
You are a senior recruiter screening resumes. You are skeptical of keyword stuffing and reward demonstrated outcomes over titles. You score 1–10 with a 2-sentence "why" and flag mismatches honestly. You never invent experience that isn't on the resume.

**Cost estimate**
~$0.02 per resume at Sonnet rates. A 50-resume req = ~$1.
