# RecruiterStack

> Welcome to the rabbit hole.

This repo is **made for staffing and recruiting agencies**.

If your agency is buried in reqs, follow-up, screening, compliance, reporting, or recruiter overload, this resource is built to help you sort out what to fix first.

<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe src="https://www.loom.com/embed/0272afd64a1f4cf9b8ff5ba50243f662" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>

**Website:** [aiintegraterz.com/audit](https://aiintegraterz.com/audit)

Drop this repo into **Claude Code** or **Codex**, answer a few plain-English questions, and it will help you:

- figure out what kind of agency you are
- identify the biggest problems worth solving first
- prioritize them in the right order
- turn them into a custom action plan
- decide whether you want to solve them with AI or hand them to us for an audit

This is not a generic AI repo and it is not a pile of disconnected ideas.

It is a staffing-specific planning resource designed to turn operational friction into a clear next-step plan.

## Why Agencies Use This

Most agencies do not have a software problem first. They have a clarity problem first.

- too many bottlenecks at once
- too many tools that do not talk to each other
- too much recruiter time spent on low-value work
- too little visibility into what should be fixed now versus later

RecruiterStack is built to solve that first layer.

It helps an owner, operator, recruiter, or sales leader get specific about the agency type, the workflow stack, the real bottlenecks, and the order those bottlenecks should be solved in.

## What RecruiterStack Actually Does

The core idea is simple:

1. diagnose the agency
2. isolate the biggest operational constraints
3. organize them into the right order
4. turn them into a plain-English plan
5. help you execute that plan with AI or route it to us for an audit

The goal is not to impress you with jargon.

The goal is to help you leave with clarity, momentum, and a realistic next move.

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

RecruiterStack is the easiest place to start, but it sits inside a broader staffing and recruiting system built specifically for this market.

- [UAIS-Staffing-AI-Vertical](https://github.com/jbellsolutions/UAIS-Staffing-AI-Vertical)
  Public-facing research, agency-type breakdowns, problem maps, solution blueprints, and staffing-specific positioning.
- [UAIS-Staffing-Internal](https://github.com/jbellsolutions/UAIS-Staffing-Internal)
  The internal implementation layer used to operationalize delivery, builds, and execution.

If you want the simplest starting point, start here.

If you want to understand the bigger operating system behind it, those repos show the wider staffing solution this resource was built from.

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

## 13 Problem Categories Solved

Every automation and agent maps back to one of these core problem categories:

| # | Category | Description |
|---|---|---|
| 1 | Candidate Sourcing & Pipeline | Automated multi-channel sourcing, passive candidate engagement, talent pool building |
| 2 | Screening & Qualification | AI-powered resume parsing, skill matching, pre-screening interviews |
| 3 | Client Acquisition & Sales | AI SDR outreach, lead scoring, proposal generation |
| 4 | Job Matching & Placement | Intelligent matching algorithms, fit scoring, shortlist generation |
| 5 | Compliance & Legal | Credential verification, license tracking, regulatory monitoring |
| 6 | Onboarding & Offboarding | Automated document collection, orientation scheduling, exit workflows |
| 7 | Billing, Payroll & Back Office | Invoice automation, timesheet processing, margin analysis |
| 8 | Communication & Follow-Up | Multi-channel nurture sequences, status updates, check-ins |
| 9 | Reporting & Analytics | Real-time dashboards, KPI tracking, predictive analytics |
| 10 | Candidate Experience | Application status updates, feedback loops, NPS tracking |
| 11 | Client Retention | Health scoring, proactive outreach, QBR preparation |
| 12 | Market Intelligence | Salary benchmarking, demand forecasting, competitive analysis |
| 13 | Internal Operations | Recruiter productivity tracking, resource allocation, training |

## 10 AI Agents Included

| Agent | Function | Runs |
|---|---|---|
| Resume Screening Agent | Parses, scores, and ranks candidates against job requirements | On submission |
| Candidate Sourcing Agent | Scrapes job boards, LinkedIn, and databases for passive candidates | Continuous |
| Client Outreach Agent | Generates personalized outreach sequences for prospective clients | Scheduled |
| Interview Scheduling Agent | Coordinates availability across candidates, recruiters, and hiring managers | On demand |
| Compliance Monitoring Agent | Tracks credentials, licenses, certifications, and regulatory deadlines | Continuous |
| Market Intelligence Agent | Monitors salary trends, demand shifts, and competitor activity | Daily |
| Client Health & Retention Agent | Scores client satisfaction and triggers proactive retention workflows | Weekly |
| Recruiter Productivity Agent | Tracks KPIs, identifies bottlenecks, and recommends workflow optimizations | Real-time |
| Post-Placement Follow-Up Agent | Manages check-ins at Day 1, 7, 30, 60, and 90 after placement | Scheduled |
| Analytics & Reporting Agent | Aggregates data across all agents into dashboards and executive reports | On demand |

## Tech Stack

| Layer | Tool | Role |
|---|---|---|
| Primary | Claude Code | The AI Integrator's main tool. Builds custom agents, direct API integrations, complex reasoning tasks. This is what makes UAIS different. |
| Secondary | n8n (self-hosted) | Orchestration and scheduling layer. Cron jobs, webhook receivers, visual monitoring. The agency-facing dashboard. |
| Autonomous | OpenClaw | The Operations Hub runtime. Runs 24/7 on dedicated cloud infrastructure. |
| Connectors | Direct ATS APIs | Bullhorn, Lever, Greenhouse, JobAdder connected via Claude Code, not middleware. |
| Scraping | Apify | Candidate sourcing, market intelligence, company research at scale. |
| Outbound | Instantly / Smartlead | High-deliverability cold email for client acquisition. |

## If You Run The App

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

## What Makes This Useful

- it starts with your actual business model, not generic AI advice
- it organizes problems before trying to sell solutions
- it keeps the language simple enough for non-technical teams
- it gives you a practical path whether you want guided DIY help or a done-for-you audit

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
