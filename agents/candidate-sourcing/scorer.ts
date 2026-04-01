/**
 * Candidate Relevance Scoring
 * Uses Claude to score candidate-to-job fit
 */

export interface ScoredCandidate {
  candidateId: string;
  name: string;
  score: number;
  reasoning: string;
  source: string;
}

export function buildScoringPrompt(candidates: any[], criteria: any): string {
  const candidateList = candidates.map((c, i) =>
    `${i + 1}. ${c.firstName} ${c.lastName} — Skills: ${c.skills?.join(', ') || 'unknown'}, Location: ${c.location?.city || 'unknown'}, ${c.location?.state || ''}`
  ).join('\n');

  return `Score these candidates 0-100 for relevance to this role:

ROLE: ${criteria.title || 'Not specified'}
REQUIRED SKILLS: ${criteria.skills?.join(', ') || 'Not specified'}
LOCATION: ${criteria.location?.city || 'Any'}, ${criteria.location?.state || ''}
MIN EXPERIENCE: ${criteria.experienceYears || 'Any'} years

CANDIDATES:
${candidateList}

Return JSON array:
[{"index": 1, "score": <0-100>, "reasoning": "<brief>"}, ...]`;
}
