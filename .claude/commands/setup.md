Guide the user through RecruiterStack first-time setup.

1. Welcome them: "Welcome to RecruiterStack! Let's configure your AI factory for your staffing agency."
2. Ask what type of staffing agency they run. Present all 17 options from config/agency-types/ directory. Let them pick one.
3. Read the selected agency type config from config/agency-types/{type}.json to get their defaults.
4. Ask what ATS they use: Bullhorn, Lever, Greenhouse, JobAdder, Crelate, iCIMS, or None
5. Ask how many recruiters are on their team
6. Show them the default pain points for their agency type and ask them to confirm or adjust their top 3
7. Write config/agency.json with all their answers:
   {
     "agencyName": "<their agency name>",
     "agencyType": "<selected type>",
     "ats": { "system": "<selected ats>" },
     "teamSize": <number>,
     "painPoints": ["<point1>", "<point2>", "<point3>"]
   }
8. Confirm: "Your RecruiterStack is configured for [type] with [ATS]. Try /screen-resumes to see it in action!"

If config/agency.json already exists, ask if they want to reconfigure everything or just update specific settings.
