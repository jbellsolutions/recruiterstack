# RecruiterStack

> Welcome to the rabbit hole.

This repo is **made for staffing and recruiting agencies**.

Drop this repo into **Claude Code** or **Codex**, answer a few plain-English questions, and it will help you:

- figure out what kind of agency you are
- identify the biggest problems worth solving first
- prioritize them in the right order
- turn them into a custom action plan
- decide whether you want to solve them with AI or hand them to us for an audit

If you want us to do the heavy lifting, book an audit here:

**[aiintegraterz.com/audit](https://aiintegraterz.com/audit)**

## How This Resource Works

1. **Start with your agency type**
   Examples: contingency, healthcare, IT staffing, direct hire, temp/contract, MSP/VMS, executive search.
2. **Tell us your ATS or current workflow stack**
   Bullhorn, Crelate, Lever, spreadsheets, inbox chaos, whatever is real for you.
3. **Pick the problems you want solved**
   Candidate sourcing, screening, compliance, timesheets, client follow-up, reporting, recruiter burnout, and more.
4. **Put those problems in order**
   We help you choose what should get fixed first, second, and later.
5. **Get a problem-by-problem plan**
   Plain English. No technical jargon required.
6. **Choose your path**
   Solve it with AI step by step, or send it to us for an audit.

## What To Say In Claude Code Or Codex

Paste this repo link in and just say:

> “Let’s go.”

Or:

> “Get started.”

Or, if you want to be more specific:

> “We’re a healthcare staffing agency on Bullhorn. Our biggest headaches are credential expirations, recruiter follow-up, and job-order visibility. Help me prioritize and build a plan.”

## Part Of A Bigger Staffing Solution

RecruiterStack is the easiest place to start, but it sits inside a broader staffing and recruiting system.

- [UAIS-Staffing-AI-Vertical](https://github.com/jbellsolutions/UAIS-Staffing-AI-Vertical)
  Public-facing research, agency-type breakdowns, problem maps, solution blueprints, and staffing-specific positioning.
- [UAIS-Staffing-Internal](https://github.com/jbellsolutions/UAIS-Staffing-Internal)
  The internal implementation layer used to operationalize delivery, builds, and execution.

If you want the simplest entry point, start here. If you want to see the bigger picture behind it, those repos show the wider staffing system this resource was built from.

## The Main Agency Buckets

- Contingency Staffing
- Retained Search
- RPO
- Temporary / Contract Staffing
- Temp-to-Perm
- Direct Hire
- Executive Search
- MSP / VMS
- SOW / Consulting Staffing
- Payrolling / EOR
- On-Demand / Gig Platforms
- Hybrid Staffing
- Niche / Boutique Agencies
- Offshore / Nearshore Staffing
- Healthcare Staffing
- IT / Tech Staffing
- Light Industrial Staffing

## The Main Problem Buckets

- Candidate Sourcing & Pipeline
- Screening & Qualification
- Client Acquisition & Sales
- Job Matching & Placement
- Compliance & Legal
- Onboarding & Offboarding
- Billing, Payroll & Back Office
- Communication & Follow-Up
- Reporting & Analytics
- Candidate Experience
- Client Retention
- Market Intelligence
- Internal Operations & Team Management

## What The App Adds

If you run the app locally, RecruiterStack also gives you:

- a clean front page built for staffing and recruiting agencies
- a guided planning chat tuned for real staffing workflows
- prebuilt solution cards around common agency bottlenecks
- a direct path from problem selection to guided execution
- optional webhook hooks for CRM, outbound, or internal systems

## Works Well With AGI-Codex

This repo is now reinforced for `agi-codex` as well.

That means `recruiterstack` includes:

- repo-local Codex hooks under `.codex/`
- repo-owned reinforcement state under `.agents/agi-codex/`
- vendored AGI-Codex skills under `.agents/skills/`
- a starting baseline for policy, runtime, and learning readiness
- self-healing / self-learning notes seeded from real issues already found in testing

This keeps the repo easy to use in plain Codex, while also making it
stronger inside a Codex-native reinforcement workflow.

## Local Setup

```bash
git clone <repo-url>
cd recruiterstack
npm install
cp .env.example .env.local
npm run dev
```

Optional environment variables:

- `ANTHROPIC_API_KEY`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `PROSPECT_WEBHOOK_URL`
- `PROSPECT_WEBHOOK_TOKEN`
- `PROSPECT_WEBHOOK_NAME`

## Files That Matter

- `README.md`
  Public-facing GitHub resource
- `CLAUDE.md`
  Claude Code conversation behavior
- `AGENTS.md`
  Codex conversation behavior
- `.codex/`
  Codex-native runtime config and hook handlers
- `.agents/agi-codex/`
  Repo-owned learning, healing, checkpoint, and review state
- `src/app/plan/page.tsx`
  Guided planning UI
- `src/app/api/plan-chat/route.ts`
  Planning conversation backend
- `src/app/api/prospects/route.ts`
  Prospect capture endpoint

## License

Proprietary — AI Integraterz.
