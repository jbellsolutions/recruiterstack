# RecruiterStack

**10 AI agents that run a staffing agency's back office.**
Drop the link in Claude Code. 5-minute conversation. Agents go live in your Paperclip dashboard.

[![AI Roadmap System for Recruiting Agencies — Watch Video](https://cdn.loom.com/sessions/thumbnails/0272afd64a1f4cf9b8ff5ba50243f662-8a89c25ed29bd8e6-full-play.gif#t=0.1)](https://www.loom.com/share/0272afd64a1f4cf9b8ff5ba50243f662)

**Website:** [aiintegraterz.com/audit](https://aiintegraterz.com/audit)

---

## The 10 Agents

Each agent is one file (`agents/<slug>/SPEC.md`) you can read, edit, or hand to your own team.

| # | Agent | What it does | Runs |
|---|---|---|---|
| 1 | [Resume Screening](agents/resume-screening/SPEC.md) | Parses incoming resumes, ranks against the req with rationale | On new application |
| 2 | [Candidate Sourcing](agents/candidate-sourcing/SPEC.md) | Pulls passive talent daily from boards + LinkedIn, dedups against ATS | Daily |
| 3 | [Client Outreach](agents/client-outreach/SPEC.md) | Researches signals, drafts personalized BD emails for recruiter approval | Daily |
| 4 | [Interview Scheduling](agents/interview-scheduling/SPEC.md) | Books interviews across candidate, recruiter, hiring manager | On demand |
| 5 | [Compliance Monitoring](agents/compliance-monitoring/SPEC.md) | Tracks credentials, licenses, expirations 30/14/7 days out | Daily |
| 6 | [Market Intelligence](agents/market-intelligence/SPEC.md) | Salary, demand, competitor benchmarks per specialty | Weekly |
| 7 | [Client Health & Retention](agents/client-health/SPEC.md) | Scores accounts, flags silent erosion before churn | Daily |
| 8 | [Recruiter Productivity](agents/recruiter-productivity/SPEC.md) | Per-recruiter scoreboards + specific weekly unblocks | Daily |
| 9 | [Post-Placement Follow-Up](agents/post-placement/SPEC.md) | Day 1/7/30/60/90 check-ins + redeployment alerts | Daily |
| 10 | [Analytics & Reporting](agents/daily-briefing/SPEC.md) | Aggregates everything into a one-page exec briefing | Daily |

---

## 60-second start

1. Open Claude Code or Codex in any folder
2. Paste: `github.com/jbellsolutions/recruiterstack`
3. Say **"Let's go"**
4. Answer 5 plain-English questions about your agency
5. Click **Activate Agents**. Your dashboard opens at `localhost:3100`.

That's it. The diagnosis maps your top problems to the right subset of the 10 agents — you don't get all 10 unless you need all 10.

---

## How it works

```
You paste link
     ↓
Claude Code reads the repo
     ↓
NL intake (agency type, ATS, top 3-5 pain points, priority)
     ↓
Diagnosis → recommendedAgents (subset of the 10)
     ↓
Activate → Paperclip auto-bootstraps if needed (npx paperclipai onboard --yes)
     ↓
Forge spawns each agent with its SPEC.md as the persona
     ↓
Paperclip dashboard at localhost:3100 shows org chart, budgets, activity
```

**Three layers, each doing one job:**

| Layer | Tool | Job |
|---|---|---|
| Runtime | Claude Code / Codex | Where the agents actually think and act, on your machine, with your API key |
| Swarm primitive | [Forge](https://github.com/jbellsolutions/forge) | Persona loading, parallel councils, self-healing, telemetry |
| Control plane | [Paperclip](https://github.com/paperclipai/paperclip) | Org chart, budgets, schedules, governance, activity log, dashboard UI |

ATS connectors (Bullhorn, Lever, Greenhouse, Crelate), sourcing (Apify), and outbound (Instantly/Smartlead) plug into agents that need them.

---

## Local setup

```bash
git clone https://github.com/jbellsolutions/recruiterstack
cd recruiterstack
npm install
cp .env.example .env.local       # add ANTHROPIC_API_KEY
npm run dev                      # starts the planning UI on :3000
```

Then open Claude Code in the same folder and say "Let's go," or visit `localhost:3000/plan` for the web UI.

To preview the Paperclip plugin without going through the planner:

```bash
npm run build:paperclip          # regenerate paperclip/agents/*.json from SPEC.md
npx paperclipai onboard --yes    # boot Paperclip on :3100
npx paperclipai plugin install ./paperclip
```

---

## Custom agents

Want an 11th agent for something specific to your agency? Add a folder under `agents/` with a `SPEC.md` matching the existing format, run `npm run build:paperclip`, and the planner will pick it up. No code change required.

---

## What if I don't want a dashboard?

The Activate flow falls back gracefully. If Paperclip isn't running or won't boot, you get a copy-pasteable spec block per agent — exact `forge run` commands and Claude Code prompts you can run by hand.

---

## Part of a bigger staffing solution

RecruiterStack is the easiest place to start. The full operating system behind it lives in:

- [UAIS-Staffing-AI-Vertical](https://github.com/jbellsolutions/UAIS-Staffing-AI-Vertical) — research, agency-type breakdowns, problem maps, blueprints
- [UAIS-Staffing-Internal](https://github.com/jbellsolutions/UAIS-Staffing-Internal) — the internal implementation layer for delivery and execution

If you want done-for-you setup, book an audit at [aiintegraterz.com/audit](https://aiintegraterz.com/audit).

---

## Files that matter

- `agents/<slug>/SPEC.md` — agent specs, single source of truth (10 of them)
- `config/pain-to-agent.json` — maps problem categories → agent slugs (used by the diagnosis)
- `orchestrator/` — TypeScript module that talks to Paperclip + Forge from the planner
- `paperclip/manifest.json` + `paperclip/agents/*.json` — Paperclip plugin (generated)
- `src/app/plan/page.tsx` — the planning UI with Activate Agents
- `src/app/api/plan-chat/route.ts` — diagnosis backend (returns `recommendedAgents`)
- `src/app/api/spawn/route.ts` — kicks off spawn into Paperclip

## License

Proprietary — AI Integraterz.
