Generate today's recruiter briefing.

1. Check config exists. If not, run /setup.
2. Pull data from ATS (or mock data) and compile these sections:

**Hot Reqs** — Open job orders sorted by priority and age. Flag any open > 7 days without a submittal.

**Follow-Ups Due** — Candidates with no contact in 3+ days. Show name, last stage, last contact date, suggested action.

**Today's Interviews** — Interviews scheduled for today and tomorrow. Include candidate name, job order, interviewer, time.

**Credential Alerts** — Credentials expiring this week. Show candidate, credential, expiration date, action needed.

**Placement Check-Ins** — Active placements approaching milestone dates (Day 7, 30, 60, 90). Show candidate, client, milestone, due date.

**Pipeline Summary** — This week's numbers: submittals, interviews, offers, placements, vs. last week and targets.

3. Use Claude to add one actionable insight (e.g., "Your pipeline is running 20% behind last week — consider prioritizing sourcing for [hot req]").
4. Format as a clean, scannable report.
5. Ask: "Want to dig into any of these items? Or send this briefing via email?"
