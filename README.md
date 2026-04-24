# RecruiterStack

> Welcome to the rabbit hole.

This repo is a **GitHub funnel for staffing and recruiting agencies**.

Drop this repo into **Claude Code** or **Codex**, answer a few plain-English questions, and it will help you:

- figure out what kind of agency you are
- identify the biggest problems worth solving first
- prioritize them in the right order
- turn them into a custom action plan
- decide whether you want to solve them with AI or hand them to us for an audit

If you want us to do the heavy lifting, book an audit here:

**[aiintegraterz.com/audit](https://aiintegraterz.com/audit)**

## How The Funnel Works

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
7. **Optionally leave your name and email at the end**
   We can save the conversation, send your custom plan, and only add you to updates or follow-up if you explicitly opt in.

## What To Say In Claude Code Or Codex

Paste this repo link in and say something like:

> “Welcome me to the rabbit hole and help me figure out what kind of staffing agency I am, which problems I should solve first, and what plan you recommend.”

Or:

> “We’re a healthcare staffing agency on Bullhorn. Our biggest headaches are credential expirations, recruiter follow-up, and job-order visibility. Help me prioritize and build a plan.”

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

- a front-page funnel / landing experience
- a planning chat tuned for staffing agencies
- prebuilt solution cards
- guided build flow
- lead capture with explicit opt-ins
- webhook-based sync into your CRM / outbound stack

## Lead Capture

Lead capture happens **after** the plan has value.

The app can save:

- name
- email
- agency type
- ATS
- selected problems
- priority order
- custom problems
- generated plan summary
- transcript / transcript summary
- help mode: guided DIY vs audit
- separate consent flags for:
  - plan + transcript delivery
  - newsletter updates
  - follow-up resources / outreach

The source of truth is the local app database. External systems are optional sinks behind a webhook.

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
  Public-facing GitHub funnel
- `CLAUDE.md`
  Claude Code funnel behavior
- `AGENTS.md`
  Codex funnel behavior
- `src/app/plan/page.tsx`
  Guided funnel UI
- `src/app/api/plan-chat/route.ts`
  Funnel conversation backend
- `src/app/api/prospects/route.ts`
  Lead capture endpoint

## Consent Note

This repo is designed so that:

- the plan itself comes first
- contact capture comes after value is delivered
- newsletter and follow-up are separate opt-ins

## License

Proprietary — Integraterz.
