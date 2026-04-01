/**
 * Candidate Source Implementations
 * Each source returns candidates in a common format
 */

export interface SourceResult {
  source: string;
  candidates: any[];
  count: number;
  status: 'success' | 'not-configured' | 'error';
  message?: string;
}

export async function searchATS(adapter: any, criteria: any): Promise<SourceResult> {
  try {
    const candidates = await adapter.getCandidates({
      skills: criteria.skills,
      location: criteria.location,
      status: ['active'],
      limit: criteria.limit || 50
    });
    return { source: 'ATS', candidates, count: candidates.length, status: 'success' };
  } catch (e) {
    return { source: 'ATS', candidates: [], count: 0, status: 'error', message: String(e) };
  }
}

export async function searchLinkedIn(criteria: any): Promise<SourceResult> {
  // Requires Apify API key
  if (!process.env.APIFY_API_KEY) {
    return { source: 'LinkedIn', candidates: [], count: 0, status: 'not-configured', message: 'Add APIFY_API_KEY to enable LinkedIn sourcing' };
  }
  // TODO: Implement Apify LinkedIn actor
  return { source: 'LinkedIn', candidates: [], count: 0, status: 'not-configured', message: 'LinkedIn integration coming soon' };
}

export async function enrichWithApollo(candidates: any[]): Promise<SourceResult> {
  if (!process.env.APOLLO_API_KEY) {
    return { source: 'Apollo', candidates, count: candidates.length, status: 'not-configured', message: 'Add APOLLO_API_KEY for candidate enrichment' };
  }
  // TODO: Implement Apollo enrichment
  return { source: 'Apollo', candidates, count: candidates.length, status: 'not-configured', message: 'Apollo enrichment coming soon' };
}

export function deduplicateCandidates(candidates: any[]): any[] {
  const seen = new Map<string, any>();
  for (const c of candidates) {
    const key = c.email?.toLowerCase() || `${c.firstName}-${c.lastName}`.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, c);
    }
  }
  return Array.from(seen.values());
}
