/**
 * ATS Adapter Layer — Unified interface for Bullhorn, Lever, Greenhouse, and Mock
 *
 * Each staffing agency uses a different ATS. This adapter normalizes the API
 * so agent scripts work identically regardless of which ATS is connected.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  skills: string[];
  experience: { company: string; title: string; startDate: string; endDate?: string }[];
  location?: string;
  status: "active" | "passive" | "placed" | "do-not-contact";
  source?: string;
  createdAt: string;
  updatedAt: string;
  raw?: Record<string, unknown>;
}

export interface JobOrder {
  id: string;
  title: string;
  clientName: string;
  clientContactId?: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  billRate?: number;
  payRate?: number;
  type: "temp" | "contract" | "perm" | "temp-to-perm" | "sow";
  status: "open" | "filled" | "on-hold" | "cancelled";
  openings: number;
  createdAt: string;
  updatedAt: string;
  raw?: Record<string, unknown>;
}

export interface Submittal {
  id: string;
  candidateId: string;
  jobOrderId: string;
  status: "submitted" | "reviewed" | "interview" | "offered" | "placed" | "rejected";
  submittedAt: string;
  notes?: string;
  raw?: Record<string, unknown>;
}

export interface Placement {
  id: string;
  candidateId: string;
  jobOrderId: string;
  startDate: string;
  endDate?: string;
  billRate: number;
  payRate: number;
  status: "active" | "completed" | "terminated";
  raw?: Record<string, unknown>;
}

export interface ATSAdapter {
  name: string;

  // Candidates
  searchCandidates(query: { skills?: string[]; location?: string; keyword?: string; limit?: number }): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate>;
  updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate>;

  // Job Orders
  getOpenJobOrders(filters?: { clientName?: string; type?: string; limit?: number }): Promise<JobOrder[]>;
  getJobOrder(id: string): Promise<JobOrder>;

  // Submittals
  createSubmittal(candidateId: string, jobOrderId: string, notes?: string): Promise<Submittal>;
  getSubmittals(jobOrderId: string): Promise<Submittal[]>;
  updateSubmittal(id: string, status: Submittal["status"], notes?: string): Promise<Submittal>;

  // Placements
  getActivePlacements(filters?: { clientName?: string; limit?: number }): Promise<Placement[]>;

  // Health check
  testConnection(): Promise<boolean>;
}

// ── Bullhorn Adapter ─────────────────────────────────────────────────────────

export class BullhornAdapter implements ATSAdapter {
  name = "Bullhorn";
  private baseUrl: string;
  private restToken: string | null = null;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;

  constructor(config: { clientId: string; clientSecret: string; username: string; password: string; baseUrl?: string }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.username = config.username;
    this.password = config.password;
    this.baseUrl = config.baseUrl || "https://rest.bullhornstaffing.com/rest-services";
  }

  private async authenticate(): Promise<void> {
    // Bullhorn OAuth 2.0 flow: auth code → access token → REST token → REST URL
    // Step 1: Get auth code
    const authRes = await fetch(
      `https://auth.bullhornstaffing.com/oauth/authorize?client_id=${this.clientId}&response_type=code&username=${this.username}&password=${this.password}&action=Login`,
      { redirect: "manual" }
    );
    const location = authRes.headers.get("location") || "";
    const code = new URL(location).searchParams.get("code");
    if (!code) throw new Error("Bullhorn: Failed to get auth code");

    // Step 2: Exchange for access token
    const tokenRes = await fetch(
      `https://auth.bullhornstaffing.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      { method: "POST" }
    );
    const tokenData = await tokenRes.json();

    // Step 3: Get REST token and URL
    const loginRes = await fetch(
      `${this.baseUrl}/login?version=*&access_token=${tokenData.access_token}`
    );
    const loginData = await loginRes.json();
    this.baseUrl = loginData.restUrl;
    this.restToken = loginData.BhRestToken;
  }

  private async request(endpoint: string, options?: RequestInit): Promise<unknown> {
    if (!this.restToken) await this.authenticate();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { BhRestToken: this.restToken!, "Content-Type": "application/json", ...options?.headers },
    });
    if (res.status === 401) {
      await this.authenticate();
      return this.request(endpoint, options);
    }
    return res.json();
  }

  async searchCandidates(query: { skills?: string[]; location?: string; keyword?: string; limit?: number }): Promise<Candidate[]> {
    const params = new URLSearchParams({ count: String(query.limit || 20), fields: "id,firstName,lastName,email,phone,occupation,skillSet,address,status,dateAdded,dateLastModified" });
    if (query.keyword) params.set("query", query.keyword);
    if (query.skills?.length) params.set("query", query.skills.join(" OR "));
    const data = await this.request(`/search/Candidate?${params}`) as { data: Record<string, unknown>[] };
    return (data.data || []).map(this.mapCandidate);
  }

  async getCandidate(id: string): Promise<Candidate> {
    const data = await this.request(`/entity/Candidate/${id}?fields=id,firstName,lastName,email,phone,occupation,skillSet,address,status,dateAdded,dateLastModified`) as { data: Record<string, unknown> };
    return this.mapCandidate(data.data);
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    await this.request(`/entity/Candidate/${id}`, { method: "POST", body: JSON.stringify(updates) });
    return this.getCandidate(id);
  }

  async getOpenJobOrders(filters?: { clientName?: string; type?: string; limit?: number }): Promise<JobOrder[]> {
    const params = new URLSearchParams({ count: String(filters?.limit || 50), fields: "id,title,clientCorporation,description,skills,address,salary,salaryUnit,employmentType,status,numOpenings,dateAdded,dateLastModified" });
    params.set("where", "status='Accepting Candidates'");
    const data = await this.request(`/query/JobOrder?${params}`) as { data: Record<string, unknown>[] };
    return (data.data || []).map(this.mapJobOrder);
  }

  async getJobOrder(id: string): Promise<JobOrder> {
    const data = await this.request(`/entity/JobOrder/${id}?fields=id,title,clientCorporation,description,skills,address,salary,salaryUnit,employmentType,status,numOpenings,dateAdded,dateLastModified`) as { data: Record<string, unknown> };
    return this.mapJobOrder(data.data);
  }

  async createSubmittal(candidateId: string, jobOrderId: string, notes?: string): Promise<Submittal> {
    const data = await this.request("/entity/Sendout", {
      method: "PUT",
      body: JSON.stringify({ candidate: { id: candidateId }, jobOrder: { id: jobOrderId }, status: "Submitted", comments: notes }),
    }) as { changedEntityId: string };
    return { id: String(data.changedEntityId), candidateId, jobOrderId, status: "submitted", submittedAt: new Date().toISOString(), notes };
  }

  async getSubmittals(jobOrderId: string): Promise<Submittal[]> {
    const data = await this.request(`/query/Sendout?where=jobOrder.id=${jobOrderId}&fields=id,candidate,jobOrder,status,dateAdded,comments&count=100`) as { data: Record<string, unknown>[] };
    return (data.data || []).map((s) => ({
      id: String(s.id),
      candidateId: String((s.candidate as Record<string, unknown>)?.id || ""),
      jobOrderId: String((s.jobOrder as Record<string, unknown>)?.id || ""),
      status: "submitted" as const,
      submittedAt: String(s.dateAdded),
      notes: s.comments as string | undefined,
      raw: s,
    }));
  }

  async updateSubmittal(id: string, status: Submittal["status"], notes?: string): Promise<Submittal> {
    await this.request(`/entity/Sendout/${id}`, { method: "POST", body: JSON.stringify({ status, comments: notes }) });
    const data = await this.request(`/entity/Sendout/${id}?fields=id,candidate,jobOrder,status,dateAdded,comments`) as { data: Record<string, unknown> };
    return { id, candidateId: String((data.data.candidate as Record<string, unknown>)?.id), jobOrderId: String((data.data.jobOrder as Record<string, unknown>)?.id), status, submittedAt: String(data.data.dateAdded), notes };
  }

  async getActivePlacements(filters?: { clientName?: string; limit?: number }): Promise<Placement[]> {
    const data = await this.request(`/query/Placement?where=status='Active'&fields=id,candidate,jobOrder,dateBegin,dateEnd,payRate,clientBillRate,status&count=${filters?.limit || 100}`) as { data: Record<string, unknown>[] };
    return (data.data || []).map((p) => ({
      id: String(p.id),
      candidateId: String((p.candidate as Record<string, unknown>)?.id),
      jobOrderId: String((p.jobOrder as Record<string, unknown>)?.id),
      startDate: String(p.dateBegin),
      endDate: p.dateEnd ? String(p.dateEnd) : undefined,
      billRate: Number(p.clientBillRate) || 0,
      payRate: Number(p.payRate) || 0,
      status: "active",
      raw: p,
    }));
  }

  async testConnection(): Promise<boolean> {
    try { await this.authenticate(); return true; } catch { return false; }
  }

  private mapCandidate(raw: Record<string, unknown>): Candidate {
    return {
      id: String(raw.id),
      firstName: String(raw.firstName || ""),
      lastName: String(raw.lastName || ""),
      email: String(raw.email || ""),
      phone: raw.phone ? String(raw.phone) : undefined,
      title: raw.occupation ? String(raw.occupation) : undefined,
      skills: typeof raw.skillSet === "string" ? raw.skillSet.split(",").map((s: string) => s.trim()) : [],
      experience: [],
      location: raw.address ? String((raw.address as Record<string, unknown>).city || "") : undefined,
      status: "active",
      createdAt: String(raw.dateAdded || ""),
      updatedAt: String(raw.dateLastModified || ""),
      raw,
    };
  }

  private mapJobOrder(raw: Record<string, unknown>): JobOrder {
    return {
      id: String(raw.id),
      title: String(raw.title || ""),
      clientName: raw.clientCorporation ? String((raw.clientCorporation as Record<string, unknown>).name || "") : "",
      description: String(raw.description || ""),
      requiredSkills: typeof raw.skills === "string" ? raw.skills.split(",").map((s: string) => s.trim()) : [],
      niceToHaveSkills: [],
      location: raw.address ? String((raw.address as Record<string, unknown>).city || "") : "",
      type: "contract",
      status: "open",
      openings: Number(raw.numOpenings) || 1,
      createdAt: String(raw.dateAdded || ""),
      updatedAt: String(raw.dateLastModified || ""),
      raw,
    };
  }
}

// ── Lever Adapter ────────────────────────────────────────────────────────────

export class LeverAdapter implements ATSAdapter {
  name = "Lever";
  private apiKey: string;
  private baseUrl = "https://api.lever.co/v1";

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  private async request(endpoint: string, options?: RequestInit): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`, "Content-Type": "application/json", ...options?.headers },
    });
    return res.json();
  }

  async searchCandidates(query: { skills?: string[]; keyword?: string; limit?: number }): Promise<Candidate[]> {
    const params = new URLSearchParams({ limit: String(query.limit || 20) });
    if (query.keyword) params.set("search", query.keyword);
    const data = await this.request(`/opportunities?${params}`) as { data: Record<string, unknown>[] };
    return (data.data || []).map((o) => ({
      id: String(o.id),
      firstName: String((o as Record<string, unknown>).name || "").split(" ")[0] || "",
      lastName: String((o as Record<string, unknown>).name || "").split(" ").slice(1).join(" ") || "",
      email: ((o.emails as string[]) || [])[0] || "",
      phone: ((o.phones as Record<string, string>[]) || [])[0]?.value,
      skills: (o.tags as string[]) || [],
      experience: [],
      status: "active",
      createdAt: String(o.createdAt || ""),
      updatedAt: String(o.updatedAt || ""),
      raw: o,
    }));
  }

  async getCandidate(id: string): Promise<Candidate> {
    const data = await this.request(`/opportunities/${id}`) as { data: Record<string, unknown> };
    const o = data.data;
    return {
      id: String(o.id),
      firstName: String(o.name || "").split(" ")[0] || "",
      lastName: String(o.name || "").split(" ").slice(1).join(" ") || "",
      email: ((o.emails as string[]) || [])[0] || "",
      skills: (o.tags as string[]) || [],
      experience: [],
      status: "active",
      createdAt: String(o.createdAt || ""),
      updatedAt: String(o.updatedAt || ""),
      raw: o,
    };
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const body: Record<string, unknown> = {};
    if (updates.skills) body.tags = updates.skills;
    await this.request(`/opportunities/${id}`, { method: "PUT", body: JSON.stringify(body) });
    return this.getCandidate(id);
  }

  async getOpenJobOrders(filters?: { limit?: number }): Promise<JobOrder[]> {
    const data = await this.request(`/postings?state=published&limit=${filters?.limit || 50}`) as { data: Record<string, unknown>[] };
    return (data.data || []).map((p) => ({
      id: String(p.id),
      title: String(p.text || ""),
      clientName: "",
      description: String((p.content as Record<string, string>)?.description || ""),
      requiredSkills: (p.tags as string[]) || [],
      niceToHaveSkills: [],
      location: String((p.categories as Record<string, string>)?.location || ""),
      type: "perm" as const,
      status: "open" as const,
      openings: 1,
      createdAt: String(p.createdAt || ""),
      updatedAt: String(p.updatedAt || ""),
      raw: p,
    }));
  }

  async getJobOrder(id: string): Promise<JobOrder> {
    const data = await this.request(`/postings/${id}`) as { data: Record<string, unknown> };
    const p = data.data;
    return {
      id: String(p.id), title: String(p.text || ""), clientName: "", description: String((p.content as Record<string, string>)?.description || ""),
      requiredSkills: (p.tags as string[]) || [], niceToHaveSkills: [], location: String((p.categories as Record<string, string>)?.location || ""),
      type: "perm", status: "open", openings: 1, createdAt: String(p.createdAt || ""), updatedAt: String(p.updatedAt || ""), raw: p,
    };
  }

  async createSubmittal(candidateId: string, jobOrderId: string, notes?: string): Promise<Submittal> {
    // Lever uses stage changes on opportunities
    return { id: `${candidateId}-${jobOrderId}`, candidateId, jobOrderId, status: "submitted", submittedAt: new Date().toISOString(), notes };
  }

  async getSubmittals(jobOrderId: string): Promise<Submittal[]> {
    const data = await this.request(`/opportunities?posting_id=${jobOrderId}&limit=100`) as { data: Record<string, unknown>[] };
    return (data.data || []).map((o) => ({
      id: String(o.id), candidateId: String(o.id), jobOrderId, status: "submitted" as const, submittedAt: String(o.createdAt || ""), raw: o,
    }));
  }

  async updateSubmittal(id: string, status: Submittal["status"], notes?: string): Promise<Submittal> {
    return { id, candidateId: id, jobOrderId: "", status, submittedAt: "", notes };
  }

  async getActivePlacements(): Promise<Placement[]> {
    return []; // Lever doesn't have a native placement concept like Bullhorn
  }

  async testConnection(): Promise<boolean> {
    try { await this.request("/users"); return true; } catch { return false; }
  }
}

// ── Greenhouse Adapter ───────────────────────────────────────────────────────

export class GreenhouseAdapter implements ATSAdapter {
  name = "Greenhouse";
  private apiKey: string;
  private baseUrl = "https://harvest.greenhouse.io/v1";

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  private async request(endpoint: string, options?: RequestInit): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`, "Content-Type": "application/json", ...options?.headers },
    });
    return res.json();
  }

  async searchCandidates(query: { keyword?: string; limit?: number }): Promise<Candidate[]> {
    const params = new URLSearchParams({ per_page: String(query.limit || 20) });
    if (query.keyword) params.set("search", query.keyword);
    const data = await this.request(`/candidates?${params}`) as Record<string, unknown>[];
    return (data || []).map((c) => ({
      id: String(c.id),
      firstName: String(c.first_name || ""),
      lastName: String(c.last_name || ""),
      email: ((c.email_addresses as Record<string, string>[]) || [])[0]?.value || "",
      phone: ((c.phone_numbers as Record<string, string>[]) || [])[0]?.value,
      skills: (c.tags as string[]) || [],
      experience: [],
      status: "active" as const,
      createdAt: String(c.created_at || ""),
      updatedAt: String(c.updated_at || ""),
      raw: c,
    }));
  }

  async getCandidate(id: string): Promise<Candidate> {
    const c = await this.request(`/candidates/${id}`) as Record<string, unknown>;
    return {
      id: String(c.id), firstName: String(c.first_name || ""), lastName: String(c.last_name || ""),
      email: ((c.email_addresses as Record<string, string>[]) || [])[0]?.value || "",
      skills: (c.tags as string[]) || [], experience: [], status: "active",
      createdAt: String(c.created_at || ""), updatedAt: String(c.updated_at || ""), raw: c,
    };
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const body: Record<string, unknown> = {};
    if (updates.firstName) body.first_name = updates.firstName;
    if (updates.lastName) body.last_name = updates.lastName;
    await this.request(`/candidates/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    return this.getCandidate(id);
  }

  async getOpenJobOrders(filters?: { limit?: number }): Promise<JobOrder[]> {
    const data = await this.request(`/jobs?status=open&per_page=${filters?.limit || 50}`) as Record<string, unknown>[];
    return (data || []).map((j) => ({
      id: String(j.id), title: String(j.name || ""), clientName: "",
      description: String(j.notes || ""), requiredSkills: [], niceToHaveSkills: [],
      location: ((j.offices as Record<string, string>[]) || [])[0]?.name || "",
      type: "perm" as const, status: "open" as const, openings: Number((j.openings as Record<string, unknown>[])?.length) || 1,
      createdAt: String(j.created_at || ""), updatedAt: String(j.updated_at || ""), raw: j,
    }));
  }

  async getJobOrder(id: string): Promise<JobOrder> {
    const j = await this.request(`/jobs/${id}`) as Record<string, unknown>;
    return {
      id: String(j.id), title: String(j.name || ""), clientName: "", description: String(j.notes || ""),
      requiredSkills: [], niceToHaveSkills: [], location: ((j.offices as Record<string, string>[]) || [])[0]?.name || "",
      type: "perm", status: "open", openings: Number((j.openings as Record<string, unknown>[])?.length) || 1,
      createdAt: String(j.created_at || ""), updatedAt: String(j.updated_at || ""), raw: j,
    };
  }

  async createSubmittal(candidateId: string, jobOrderId: string, notes?: string): Promise<Submittal> {
    const data = await this.request("/applications", {
      method: "POST",
      body: JSON.stringify({ candidate_id: Number(candidateId), job_id: Number(jobOrderId), source_id: null }),
    }) as Record<string, unknown>;
    return { id: String(data.id), candidateId, jobOrderId, status: "submitted", submittedAt: new Date().toISOString(), notes };
  }

  async getSubmittals(jobOrderId: string): Promise<Submittal[]> {
    const data = await this.request(`/applications?job_id=${jobOrderId}&per_page=100`) as Record<string, unknown>[];
    return (data || []).map((a) => ({
      id: String(a.id), candidateId: String(a.candidate_id), jobOrderId,
      status: "submitted" as const, submittedAt: String(a.applied_at || ""), raw: a,
    }));
  }

  async updateSubmittal(id: string, status: Submittal["status"], notes?: string): Promise<Submittal> {
    return { id, candidateId: "", jobOrderId: "", status, submittedAt: "", notes };
  }

  async getActivePlacements(): Promise<Placement[]> {
    return []; // Greenhouse tracks offers, not staffing placements
  }

  async testConnection(): Promise<boolean> {
    try { await this.request("/users?per_page=1"); return true; } catch { return false; }
  }
}

// ── Mock Adapter (for demos and testing) ─────────────────────────────────────

export class MockAdapter implements ATSAdapter {
  name = "Mock";
  private candidates: Candidate[] = [
    { id: "1", firstName: "Sarah", lastName: "Chen", email: "sarah@example.com", phone: "555-0101", title: "Senior Java Developer", skills: ["Java", "Spring Boot", "AWS", "Microservices"], experience: [{ company: "TechCorp", title: "Senior Developer", startDate: "2020-01" }], location: "Austin, TX", status: "active", createdAt: "2024-01-15", updatedAt: "2024-03-01" },
    { id: "2", firstName: "Marcus", lastName: "Williams", email: "marcus@example.com", phone: "555-0102", title: "RN - ICU", skills: ["ICU", "ACLS", "BLS", "Epic EMR", "Critical Care"], experience: [{ company: "Memorial Hospital", title: "ICU Nurse", startDate: "2019-06" }], location: "Houston, TX", status: "active", createdAt: "2024-02-01", updatedAt: "2024-03-15" },
    { id: "3", firstName: "Elena", lastName: "Rodriguez", email: "elena@example.com", title: "CNC Machinist", skills: ["CNC Programming", "G-Code", "Haas", "Mazak", "Blueprint Reading"], experience: [{ company: "PrecisionParts Inc", title: "Lead Machinist", startDate: "2018-03" }], location: "Dallas, TX", status: "active", createdAt: "2024-01-20", updatedAt: "2024-02-28" },
    { id: "4", firstName: "James", lastName: "O'Brien", email: "james@example.com", phone: "555-0104", title: "Warehouse Supervisor", skills: ["Forklift", "OSHA", "Inventory Management", "WMS", "Team Leadership"], experience: [{ company: "LogiCo", title: "Shift Supervisor", startDate: "2021-01" }], location: "San Antonio, TX", status: "active", createdAt: "2024-02-10", updatedAt: "2024-03-10" },
    { id: "5", firstName: "Priya", lastName: "Patel", email: "priya@example.com", title: "Accounting Manager", skills: ["QuickBooks", "SAP", "GAAP", "Financial Reporting", "CPA"], experience: [{ company: "FinanceGroup", title: "Senior Accountant", startDate: "2017-09" }], location: "Remote", status: "passive", createdAt: "2024-01-05", updatedAt: "2024-03-20" },
  ];

  private jobOrders: JobOrder[] = [
    { id: "101", title: "Senior Java Developer", clientName: "Acme Corp", description: "Need experienced Java developer for microservices migration", requiredSkills: ["Java", "Spring Boot", "AWS"], niceToHaveSkills: ["Kubernetes", "Terraform"], location: "Austin, TX", billRate: 95, payRate: 65, type: "contract", status: "open", openings: 2, createdAt: "2024-03-01", updatedAt: "2024-03-01" },
    { id: "102", title: "ICU Registered Nurse", clientName: "Memorial Health System", description: "13-week travel assignment, night shift", requiredSkills: ["ICU", "ACLS", "BLS"], niceToHaveSkills: ["Epic EMR"], location: "Houston, TX", billRate: 85, payRate: 55, type: "temp", status: "open", openings: 3, createdAt: "2024-03-05", updatedAt: "2024-03-05" },
    { id: "103", title: "CNC Machinist - 2nd Shift", clientName: "PrecisionMfg", description: "Experienced machinist for aerospace parts", requiredSkills: ["CNC Programming", "Blueprint Reading"], niceToHaveSkills: ["Mazak", "Haas"], location: "Dallas, TX", billRate: 45, payRate: 32, type: "temp-to-perm", status: "open", openings: 1, createdAt: "2024-03-10", updatedAt: "2024-03-10" },
  ];

  async searchCandidates(query: { skills?: string[]; keyword?: string; limit?: number }): Promise<Candidate[]> {
    let results = [...this.candidates];
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      results = results.filter((c) => `${c.firstName} ${c.lastName} ${c.title} ${c.skills.join(" ")}`.toLowerCase().includes(kw));
    }
    if (query.skills?.length) {
      results = results.filter((c) => query.skills!.some((s) => c.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))));
    }
    return results.slice(0, query.limit || 20);
  }

  async getCandidate(id: string): Promise<Candidate> {
    const c = this.candidates.find((c) => c.id === id);
    if (!c) throw new Error(`Candidate ${id} not found`);
    return c;
  }

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const idx = this.candidates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Candidate ${id} not found`);
    this.candidates[idx] = { ...this.candidates[idx], ...data, updatedAt: new Date().toISOString() };
    return this.candidates[idx];
  }

  async getOpenJobOrders(filters?: { clientName?: string; limit?: number }): Promise<JobOrder[]> {
    let results = this.jobOrders.filter((j) => j.status === "open");
    if (filters?.clientName) results = results.filter((j) => j.clientName.toLowerCase().includes(filters.clientName!.toLowerCase()));
    return results.slice(0, filters?.limit || 50);
  }

  async getJobOrder(id: string): Promise<JobOrder> {
    const j = this.jobOrders.find((j) => j.id === id);
    if (!j) throw new Error(`Job order ${id} not found`);
    return j;
  }

  async createSubmittal(candidateId: string, jobOrderId: string, notes?: string): Promise<Submittal> {
    return { id: `sub-${Date.now()}`, candidateId, jobOrderId, status: "submitted", submittedAt: new Date().toISOString(), notes };
  }

  async getSubmittals(): Promise<Submittal[]> {
    return [];
  }

  async updateSubmittal(id: string, status: Submittal["status"], notes?: string): Promise<Submittal> {
    return { id, candidateId: "", jobOrderId: "", status, submittedAt: "", notes };
  }

  async getActivePlacements(): Promise<Placement[]> {
    return [
      { id: "p1", candidateId: "1", jobOrderId: "101", startDate: "2024-02-01", billRate: 95, payRate: 65, status: "active" },
      { id: "p2", candidateId: "2", jobOrderId: "102", startDate: "2024-02-15", endDate: "2024-05-15", billRate: 85, payRate: 55, status: "active" },
    ];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

export type ATSConfig =
  | { type: "bullhorn"; clientId: string; clientSecret: string; username: string; password: string; baseUrl?: string }
  | { type: "lever"; apiKey: string }
  | { type: "greenhouse"; apiKey: string }
  | { type: "mock" };

export function createATSAdapter(config: ATSConfig): ATSAdapter {
  switch (config.type) {
    case "bullhorn": return new BullhornAdapter(config);
    case "lever": return new LeverAdapter(config);
    case "greenhouse": return new GreenhouseAdapter(config);
    case "mock": return new MockAdapter();
  }
}
