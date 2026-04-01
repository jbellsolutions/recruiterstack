Run the candidate sourcing pipeline to find candidates matching job requirements.

1. Check config exists. If not, run /setup.
2. Ask for search criteria: role title, required skills, location, experience level, salary/rate range.
3. Search sources in priority order:
   - ATS internal database (always first)
   - LinkedIn (if Apify configured)
   - Indeed (if configured)
   - Apollo enrichment (if configured)
4. Deduplicate candidates across sources by email and fuzzy name match.
5. Score relevance against the search criteria using Claude.
6. Display enriched profiles ranked by fit score.
7. Ask: "Want to screen these candidates against a specific job order? Run /screen-resumes"

If external sources aren't configured, search ATS/mock data only and note which additional sources could be enabled.
