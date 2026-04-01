/**
 * Email Sequence Writer
 * Generates personalized 3-email outreach sequences
 */

export interface EmailSequence {
  emails: {
    day: number;
    subject: string;
    body: string;
    wordCount: number;
  }[];
  targetCompany: string;
  targetPerson: string;
}

export function buildSequencePrompt(
  senderName: string,
  targetName: string,
  targetTitle: string,
  companyName: string,
  industry: string,
  observation: string,
  agencyStrength: string
): string {
  return `Write a 3-email cold outreach sequence for a staffing agency.

SENDER: ${senderName} (staffing agency owner)
TARGET: ${targetName}, ${targetTitle} at ${companyName} (${industry})
OBSERVATION: ${observation}
OUR STRENGTH: ${agencyStrength}

RULES:
- Each email MUST be under 80 words
- Professional but warm tone — like a knowledgeable peer, not a salesperson
- Email 1 (Day 0): Pattern interrupt — lead with the specific observation
- Email 2 (Day 3): Proof — share a relevant result or case study
- Email 3 (Day 8): Soft close — graceful "door's open" exit
- Sign each email with just "${senderName}" — no last name, no title, no company
- No emojis, no exclamation points
- Subject lines: 3-5 words, lowercase, specific

Return JSON:
{
  "emails": [
    { "day": 0, "subject": "<string>", "body": "<string>" },
    { "day": 3, "subject": "<string>", "body": "<string>" },
    { "day": 8, "subject": "<string>", "body": "<string>" }
  ]
}`;
}
