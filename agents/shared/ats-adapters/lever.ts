import type {
  ATSAdapter,
  AgencyConfig,
  Candidate,
  CandidateFilter,
  Credential,
  JobOrder,
  JobOrderFilter,
  Placement,
  ScreeningResult,
  Submission,
} from './types.js';

/**
 * Lever ATS Adapter
 *
 * Lever API Reference: https://hire.lever.co/developer/documentation
 *
 * Authentication: API Key (passed as Basic Auth username, password left blank)
 *   Header: Authorization: Basic {base64(apiKey + ":")}
 *
 * Key Lever API Endpoints:
 *   GET  /v1/opportunities             - List candidates (Lever calls them "opportunities")
 *   GET  /v1/opportunities/{id}        - Single candidate/opportunity
 *   GET  /v1/postings                  - List job postings (equivalent to job orders)
 *   GET  /v1/postings/{id}             - Single posting
 *   POST /v1/opportunities/{id}/stage  - Move candidate through pipeline stages
 *   GET  /v1/opportunities/{id}/offers - Get offers (closest to placements)
 *
 * Field Mappings (Lever → our types):
 *   Opportunity → Candidate:
 *     id → id, name (parsed) → firstName/lastName
 *     emails[0] → email, phones[0].value → phone
 *     tags → skills, location → location (parsed)
 *     sources[0] → source, stageId → status (mapped via stage name)
 *     lastInteractionAt → lastContactDate
 *
 *   Posting → JobOrder:
 *     id → id, text → title, hiringManager → recruiterAssigned
 *     content.description → description
 *     categories.location → location (parsed)
 *     tags → mustHaveSkills, state → status (mapped)
 *     createdAt → createdDate
 *
 *   Offer → Placement:
 *     id → id, opportunityId → candidateId
 *     posting → jobOrderId, startDate → startDate
 *     salary → payRate, status → status
 */
export class LeverAdapter implements ATSAdapter {
  name = 'lever';
  connected = false;

  private config: AgencyConfig;
  private apiKey: string | null = null;
  private baseUrl = 'https://api.lever.co/v1';

  constructor(config: AgencyConfig) {
    this.config = config;
    if (config.ats.apiKey) {
      this.apiKey = config.ats.apiKey;
      this.connected = true;
    }
  }

  private ensureConnected(): void {
    if (!this.connected || !this.apiKey) {
      throw new Error('Not connected - run /setup to configure Lever API key');
    }
  }

  /**
   * TODO: Build Authorization header from API key
   * return `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`
   */
  private getAuthHeader(): string {
    this.ensureConnected();
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  // ── ATSAdapter Implementation ─────────────────────────────────────────

  async getCandidates(_filters?: CandidateFilter): Promise<Candidate[]> {
    this.ensureConnected();
    // TODO: GET /v1/opportunities?limit=100&expand=applications,stage
    // Apply query params from filters: tag (skills), location, archived (status)
    // Parse response and map Lever opportunity objects to Candidate interface
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async getCandidate(_id: string): Promise<Candidate | null> {
    this.ensureConnected();
    // TODO: GET /v1/opportunities/{id}?expand=applications,stage
    // Map response to Candidate interface
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async updateCandidateScore(_candidateId: string, _score: ScreeningResult): Promise<void> {
    this.ensureConnected();
    // TODO: POST /v1/opportunities/{id}/notes
    // Body: { value: "AI Screening Score: {score}\n{reasoning}" }
    // Lever uses tags for lightweight metadata; add score-based tag
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async getJobOrders(_filters?: JobOrderFilter): Promise<JobOrder[]> {
    this.ensureConnected();
    // TODO: GET /v1/postings?state=published (or other states based on filters)
    // Map Lever posting objects to JobOrder interface
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async getJobOrder(_id: string): Promise<JobOrder | null> {
    this.ensureConnected();
    // TODO: GET /v1/postings/{id}
    // Map response to JobOrder interface
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async submitCandidate(_submission: Submission): Promise<void> {
    this.ensureConnected();
    // TODO: POST /v1/opportunities/{candidateId}/addPostings
    // Body: { postings: [jobOrderId] }
    // Then advance stage: POST /v1/opportunities/{candidateId}/stage
    throw new Error('Not connected - run /setup to configure Lever API key');
  }

  async getCredentials(_candidateId?: string): Promise<Credential[]> {
    this.ensureConnected();
    // NOTE: Lever does not have a native credentials/certifications entity.
    // TODO: Credentials could be stored as custom fields or file attachments.
    // GET /v1/opportunities/{candidateId}/files to look for credential documents
    // Parse file metadata into Credential interface
    return [];
  }

  async getPlacements(_filters?: { status?: string[]; candidateId?: string }): Promise<Placement[]> {
    this.ensureConnected();
    // TODO: GET /v1/opportunities?expand=offers&stage=offer
    // Filter by offer.status and opportunity.id
    // Map Lever offer objects to Placement interface
    throw new Error('Not connected - run /setup to configure Lever API key');
  }
}
