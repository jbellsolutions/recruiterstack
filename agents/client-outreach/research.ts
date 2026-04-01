/**
 * Company Research Module
 * Researches target companies for personalized outreach
 */

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  location: string;
  hiringSignals: string[];
  decisionMakers: { name: string; title: string; email?: string }[];
  recentNews?: string[];
  competitors?: string[];
}

export async function researchCompany(companyName: string): Promise<CompanyProfile | null> {
  // Check for Apollo/Apify API keys
  if (process.env.APOLLO_API_KEY) {
    // TODO: Implement Apollo company lookup
    console.log('Apollo API configured — would fetch real company data');
  }

  if (process.env.APIFY_API_KEY) {
    // TODO: Implement Apify web scraping for company research
    console.log('Apify API configured — would scrape company data');
  }

  // Fallback: return null and let the caller ask Claude or the user for info
  return null;
}

export function buildResearchPrompt(companyName: string, additionalContext?: string): string {
  return `Research this company for a staffing agency's business development outreach:

Company: ${companyName}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Based on what you know, provide:
1. Industry and approximate size
2. Likely hiring challenges they face
3. The best decision-maker titles to target (VP Talent, HR Director, etc.)
4. A specific observation that could be used as a pattern interrupt in a cold email

Return as JSON:
{
  "industry": "<string>",
  "size": "<string>",
  "location": "<string>",
  "hiringChallenges": ["<string>"],
  "targetTitles": ["<string>"],
  "patternInterrupt": "<specific observation for email opening>"
}`;
}
