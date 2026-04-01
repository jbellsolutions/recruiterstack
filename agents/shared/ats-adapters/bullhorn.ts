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
 * Bullhorn ATS Adapter
 *
 * Bullhorn REST API Reference: https://bullhorn.github.io/rest-api-docs/
 *
 * Authentication: OAuth 2.0 flow
 *   1. Redirect user to: https://auth.bullhornstaffing.com/oauth/authorize?client_id=...&response_type=code
 *   2. Exchange auth code for access_token + refresh_token via POST /oauth/token
 *   3. Login to REST API via GET https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=...
 *   4. Use returned BhRestToken + restUrl for all subsequent API calls
 *
 * Key Bullhorn REST Endpoints:
 *   GET  {restUrl}/entity/Candidate/{id}         - Single candidate
 *   GET  {restUrl}/search/Candidate?query=...     - Search candidates (Lucene syntax)
 *   GET  {restUrl}/entity/JobOrder/{id}           - Single job order
 *   GET  {restUrl}/search/JobOrder?query=...      - Search job orders
 *   POST {restUrl}/entity/Sendout                 - Create submission (Sendout)
 *   GET  {restUrl}/entity/Placement/{id}          - Single placement
 *   GET  {restUrl}/search/Placement?query=...     - Search placements
 *   GET  {restUrl}/entity/CandidateCertification  - Candidate credentials
 *
 * Field Mappings (Bullhorn → our types):
 *   Candidate:
 *     id → id, firstName → firstName, lastName → lastName
 *     email → email, phone → phone, skillList → skills (comma-separated string → array)
 *     address.city → location.city, address.state → location.state
 *     source → source, status → status, dateLastComment → lastContactDate
 *     description → resumeText
 *
 *   JobOrder:
 *     id → id, title → title, clientCorporation.name → clientName
 *     publicDescription → description, skillList → mustHaveSkills
 *     address.city → location.city, address.state → location.state
 *     payRate → payRate, clientBillRate → billRate
 *     numOpenings → openings, isOpen/status → status
 *     dateAdded → createdDate
 *
 *   Placement:
 *     id → id, candidate.id → candidateId, jobOrder.id → jobOrderId
 *     dateBegin → startDate, dateEnd → endDate
 *     payRate → payRate, clientBillRate → billRate
 *     status → status, employmentType → type
 */
export class BullhornAdapter implements ATSAdapter {
  name = 'bullhorn';
  connected = false;

  private config: AgencyConfig;
  private restUrl: string | null = null;
  private bhRestToken: string | null = null;

  constructor(config: AgencyConfig) {
    this.config = config;
  }

  // ── OAuth 2.0 Authentication ──────────────────────────────────────────

  /**
   * TODO: Implement OAuth 2.0 authorization flow
   *
   * Steps:
   * 1. Build authorization URL with config.ats.clientId
   * 2. Open browser or return URL for user to authorize
   * 3. Handle callback with authorization code
   * 4. Exchange code for access_token via POST to /oauth/token
   * 5. Login to REST API via GET /rest-services/login
   * 6. Store bhRestToken and restUrl for session
   * 7. Set this.connected = true
   */
  async authenticate(): Promise<void> {
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  private ensureConnected(): void {
    if (!this.connected || !this.restUrl || !this.bhRestToken) {
      throw new Error('Not connected - run /setup to configure Bullhorn credentials');
    }
  }

  // ── ATSAdapter Implementation ─────────────────────────────────────────

  async getCandidates(_filters?: CandidateFilter): Promise<Candidate[]> {
    this.ensureConnected();
    // TODO: Build Lucene query from filters
    // GET {restUrl}/search/Candidate?query={luceneQuery}&fields=id,firstName,lastName,email,...&count=50
    // Map Bullhorn Candidate entity fields to our Candidate interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async getCandidate(_id: string): Promise<Candidate | null> {
    this.ensureConnected();
    // TODO: GET {restUrl}/entity/Candidate/{id}?fields=id,firstName,lastName,email,phone,...
    // Map response to Candidate interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async updateCandidateScore(_candidateId: string, _score: ScreeningResult): Promise<void> {
    this.ensureConnected();
    // TODO: POST {restUrl}/entity/Candidate/{id}
    // Update custom fields: customFloat1 (overallScore), customText1 (recommendation)
    // Add note via POST {restUrl}/entity/Note with score reasoning
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async getJobOrders(_filters?: JobOrderFilter): Promise<JobOrder[]> {
    this.ensureConnected();
    // TODO: Build Lucene query from filters
    // GET {restUrl}/search/JobOrder?query={luceneQuery}&fields=id,title,clientCorporation,...&count=50
    // Map Bullhorn JobOrder entity to our JobOrder interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async getJobOrder(_id: string): Promise<JobOrder | null> {
    this.ensureConnected();
    // TODO: GET {restUrl}/entity/JobOrder/{id}?fields=id,title,clientCorporation,...
    // Map response to JobOrder interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async submitCandidate(_submission: Submission): Promise<void> {
    this.ensureConnected();
    // TODO: POST {restUrl}/entity/Sendout
    // Body: { candidate: { id }, jobOrder: { id }, ... }
    // Bullhorn "Sendout" is equivalent to our Submission
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async getCredentials(_candidateId?: string): Promise<Credential[]> {
    this.ensureConnected();
    // TODO: GET {restUrl}/search/CandidateCertification?query=candidate.id:{candidateId}
    // Fields: id, candidate.id, certification, status, dateExpire, dateIssued
    // Map to our Credential interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }

  async getPlacements(_filters?: { status?: string[]; candidateId?: string }): Promise<Placement[]> {
    this.ensureConnected();
    // TODO: GET {restUrl}/search/Placement?query={luceneQuery}
    // Fields: id, candidate.id, jobOrder.id, dateBegin, dateEnd, payRate, clientBillRate, status, employmentType
    // Map to our Placement interface
    throw new Error('Not connected - run /setup to configure Bullhorn credentials');
  }
}
