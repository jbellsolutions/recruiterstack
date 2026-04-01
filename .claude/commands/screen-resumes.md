Run the resume screening agent to score and rank candidates against a job order.

1. Check config/agency.json exists. If not, run /setup first.
2. Ask for job order details: title, must-have skills, nice-to-have skills, location, experience level. OR if connected to ATS, offer to pull an open job order.
3. Ask for resumes: file paths to PDFs/DOCXs, a directory of resumes, or pull from ATS.
4. Run the screening agent: npx tsx agents/resume-screening/index.ts
5. Display results as a ranked table: Rank, Name, Score (0-100), Recommendation (Submit/Maybe/Pass), Key Strengths, Concerns
6. Ask: "Want to submit the top candidates?" or "Want to adjust the scoring rubric?"

If ATS not connected, use sample data from data/ directory and note: "Running with sample data. Connect your ATS via /setup for live results."

The scoring rubric is loaded from config/scoring-rubrics/ based on agency type (healthcare, IT, light industrial, or general).
