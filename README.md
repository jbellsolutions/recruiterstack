# RecruiterStack AI

AI-powered staffing & recruiting solutions platform. Built by [Integraterz](mailto:justin@integraterz.com).

Fork of BuildStack — customized for the staffing and recruiting industry with 20 pre-built solutions, staffing-domain AI planning, and industry-specific agent playbooks.

## What It Does

- **Solutions Tab**: 20 pre-built recruiting/staffing tools across 5 categories (Candidate Pipeline, Client Development, Operations & Compliance, Analytics & Intelligence, Recruiter Productivity)
- **Plan Tab**: AI chat assistant that speaks staffing — knows ATS systems, bill rates, submittals, fill rates, compliance requirements
- **Dashboard**: Autonomous dev team builds the tools you select — 9-phase pipeline from spec to deployment

## Quick Start

```bash
git clone <repo-url>
cd recruiterstack
npm install
cp .env.example .env.local
# Add: ANTHROPIC_API_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
npm run dev
```

Deploy to Railway: `railway up`

## Stack

- Next.js 16.2 + React 19 + TypeScript
- Tailwind CSS 4
- LibSQL / Turso (database)
- Anthropic Claude API (AI planning + agent pipeline)

## Customization

This is a demo instance for staffing/recruiting prospects. For production deployment, Integraterz fully customizes:
- Solutions list for your specific agency type
- AI chat tuned to your workflows and ATS
- Agent playbooks with your domain context
- Branding, integrations, and deployment

## License

Proprietary — Integraterz.
