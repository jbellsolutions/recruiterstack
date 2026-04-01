Run a credential and compliance audit.

1. Check config exists. If not, run /setup.
2. Load agency type to determine compliance requirements (healthcare = strict, light industrial = moderate, etc.)
3. Pull credential data from ATS or mock adapter.
4. Check each credential against rules:
   - CRITICAL (red): Expired credentials, missing required credentials
   - WARNING (yellow): Expiring within 30 days
   - INFO (blue): Expiring within 60-90 days
   - OK (green): Valid and current
5. For healthcare agencies: Check NLC compact state compliance for all nurses.
6. Display compliance report:
   - Summary: X OK, Y expiring, Z expired, W missing
   - Per-candidate breakdown with specific action items
   - Critical alerts at the top
7. Ask: "Want to send renewal reminders to candidates with expiring credentials?"
