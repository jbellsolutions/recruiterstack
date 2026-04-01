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
 * Greenhouse Harvest API Adapter
 *
 * Greenhouse Harvest API Reference: https://developers.greenhouse.io/harvest.html
 *
 * Authentication: Basic Auth
 *   Header: Authorization: Basic {base64(apiKey + ":")}
 *   The API key is used as the username; password is empty.
 *
 * Key Greenhouse Harvest API Endpoints:
 *   GET  /v1/candidates                    - List all candidates
 *   GET  /v1/candidates/{id}               - Single candidate
 *   GET  /v1/jobs                          - List all jobs (equivalent to job orders)
 *   GET  /v1/jobs/{id}                     - Single job
 *   POST /v1/candidates/{id}/applications  - Submit candidate to a job
 *   GET  /v1/offers                        - List offers (closest to placements)
 *   GET  /v1/offers/{id}                   - Single offer
 *   GET  /v1/candidates/{id}/applications  - Candidate's applications
 *
 * Field Mappings (Greenhouse → our types):
 *   Candidate → Candidate:
 *     id → id, first_name → firstName, last_name → lastName
 *     email_addresses[0].value → email, phone_numbers[0].value → phone
 *     tags → skills, addresses[0] → location (parsed)
 *     source.public_name → source
 *     applications[0].status → status (mapped)
 *     last_activity → lastContactDate
 *
 *   Job → JobOrder:
 *     id → id, name → title
 *     departments[0].name → clientName (or custom field)
 *     notes → description, offices[0] → location
 *     openings[].status → openings count
 *     status → status (mapped: open/closed/draft)
 *     created_at → createdDate
 *
 *   Offer → Placement:
 *     id → id, application.candidate_id → candidateId
 *     application.job_id → jobOrderId
 *     starts_at → startDate, status → status (mapped)
 *     custom_fields may contain pay/bill rates
 */
export class GreenhouseAdapter implements ATSAdapter {
  name = 'greenhouse';
  connected = false;

  private config: AgencyConfig;
  private apiKey: string | null = null;
  private baseUrl = 'https://harvest.greenhouse.io/v1';

  constructor(config: AgencyConfig) {
    this.config = config;
    if (config.ats.apiKey) {
      this.apiKey = config.ats.apiKey;
      this.connected = true;
    }
  }

  private ensureConnected(): void {
    if (!this.connected || !this.apiKey) {
      throw new Error('Not connected - run /setup to configure Greenhouse API key');
    }
  }

  /**
   * TODO: Build Authorization header
   * return `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`
   */
  private getAuthHeader(): string {
    this.ensureConnected();
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  // ── ATSAdapter Implementation ─────────────────────────────────────────

  async getCandidates(_filters?: CandidateFilter): Promise<Candidate[]> {
    this.ensureConnected();
    // TODO: GET /v1/candidates?per_page=100
    // Greenhouse supports query params: created_after, updated_after, email
    // For skill/location filtering, fetch all then filter client-side
    // (Greenhouse search is limited compared to Bullhorn)
    // Map response array to Candidate[] interface
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async getCandidate(_id: string): Promise<Candidate | null> {
    this.ensureConnected();
    // TODO: GET /v1/candidates/{id}
    // Map response to Candidate interface
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async updateCandidateScore(_candidateId: string, _score: ScreeningResult): Promise<void> {
    this.ensureConnected();
    // TODO: POST /v1/candidates/{id}/activity_feed/notes
    // Body: { user_id: ..., body: "AI Screening Score: ...", visibility: "admin_only" }
    // Optionally update custom candidate fields with score via PATCH /v1/candidates/{id}
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async getJobOrders(_filters?: JobOrderFilter): Promise<JobOrder[]> {
    this.ensureConnected();
    // TODO: GET /v1/jobs?per_page=100&status=open
    // Apply filters: status, created_after
    // Map Greenhouse job objects to JobOrder interface
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async getJobOrder(_id: string): Promise<JobOrder | null> {
    this.ensureConnected();
    // TODO: GET /v1/jobs/{id}
    // Map response to JobOrder interface
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async submitCandidate(_submission: Submission): Promise<void> {
    this.ensureConnected();
    // TODO: POST /v1/candidates/{candidateId}/applications
    // Body: { job_id: jobOrderId, source_id: ..., referrer: ... }
    // This creates an application linking the candidate to the job
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }

  async getCredentials(_candidateId?: string): Promise<Credential[]> {
    this.ensureConnected();
    // NOTE: Greenhouse does not have a native credentials entity.
    // TODO: Credentials may be stored as:
    //   - Custom candidate fields (GET /v1/candidates/{id} then parse custom_fields)
    //   - Attachments (GET /v1/candidates/{id}/attachments)
    // Parse into Credential interface
    return [];
  }

  async getPlacements(_filters?: { status?: string[]; candidateId?: string }): Promise<Placement[]> {
    this.ensureConnected();
    // TODO: GET /v1/offers?per_page=100
    // Filter by status (accepted, rejected, etc.) and application.candidate_id
    // Map Greenhouse offer objects to Placement interface
    // Note: Greenhouse offers may not include bill/pay rates natively;
    // these might live in custom fields
    throw new Error('Not connected - run /setup to configure Greenhouse API key');
  }
}
