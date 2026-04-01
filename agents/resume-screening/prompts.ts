/**
 * Resume Screening Prompts — Configurable scoring rubrics and prompt templates
 */

export interface RubricWeights {
  [dimension: string]: number;
}

export function buildQuickScreenPrompt(resumeText: string, requirements: string): string {
  return `Quick-screen this resume against these requirements. Return a single number 0-100 indicating match strength. Just the number, nothing else.

REQUIREMENTS: ${requirements}

RESUME:
${resumeText.slice(0, 2000)}

Score (0-100):`;
}

export function buildFullScreenPrompt(
  candidateName: string,
  skills: string[],
  experience: string,
  resumeText: string | undefined,
  jobTitle: string,
  clientName: string,
  requirements: string,
  mustHaveSkills: string[],
  niceToHaveSkills: string[],
  location: string,
  remote: boolean,
  weights: RubricWeights
): string {
  return `You are a senior recruiting specialist screening candidates for a staffing agency.

CANDIDATE: ${candidateName}
Skills: ${skills.join(', ')}
Experience:
${experience}
${resumeText ? `\nFull Resume:\n${resumeText.slice(0, 3000)}` : ''}

JOB ORDER: ${jobTitle} at ${clientName}
Requirements: ${requirements}
Must-Have Skills: ${mustHaveSkills.join(', ')}
Nice-to-Have: ${niceToHaveSkills.join(', ')}
Location: ${location}${remote ? ' (Remote OK)' : ''}

SCORING RUBRIC (weights must sum to 100):
${Object.entries(weights).map(([k, v]) => `- ${k}: ${v}%`).join('\n')}

INSTRUCTIONS:
1. Score each dimension 0-100
2. Compute weighted overall score
3. 70+ = "submit", 40-69 = "maybe", below 40 = "pass"
4. Identify key strengths and concerns
5. Write 2-3 sentence reasoning

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "overallScore": <number>,
  "dimensions": { ${Object.keys(weights).map(k => `"${k}": <number>`).join(', ')} },
  "recommendation": "submit" | "maybe" | "pass",
  "reasoning": "<string>",
  "keyStrengths": ["<string>", "<string>"],
  "concerns": ["<string>"]
}`;
}

export function parseScreeningJSON(text: string): any | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
