// Core data types for staffing operations

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  location: { city: string; state: string; zip?: string };
  resumeText?: string;
  resumeFilePath?: string;
  source: string;
  status: string;
  lastContactDate?: string;
  credentials?: Credential[];
  notes?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  graduationDate?: string;
}

export interface JobOrder {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  description: string;
  requirements: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  location: { city: string; state: string; remote?: boolean };
  payRate?: { min: number; max: number; type: 'hourly' | 'salary' };
  billRate?: { min: number; max: number; type: 'hourly' | 'salary' };
  openings: number;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'open' | 'filled' | 'on-hold' | 'cancelled';
  createdDate: string;
  dueDate?: string;
  recruiterAssigned?: string;
}

export interface Credential {
  id: string;
  candidateId: string;
  type: string;
  name: string;
  state?: string;
  issueDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'expiring-soon' | 'pending' | 'missing';
  verifiedDate?: string;
  documentUrl?: string;
}

export interface Placement {
  id: string;
  candidateId: string;
  jobOrderId: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  payRate: number;
  billRate: number;
  status: 'active' | 'completed' | 'terminated' | 'pending-start';
  type: 'contract' | 'direct-hire' | 'temp-to-perm';
  lastCheckIn?: string;
}

export interface Submission {
  candidateId: string;
  jobOrderId: string;
  score: number;
  reasoning: string;
  recommendation: 'submit' | 'maybe' | 'pass';
  submittedDate: string;
}

export interface ScreeningResult {
  candidate: Candidate;
  jobOrder: JobOrder;
  overallScore: number;
  dimensions: {
    skillsMatch: number;
    experienceDepth: number;
    industryFit: number;
    locationFit: number;
    availability: number;
  };
  reasoning: string;
  recommendation: 'submit' | 'maybe' | 'pass';
  keyStrengths: string[];
  concerns: string[];
}

export interface ComplianceAlert {
  candidateId: string;
  candidateName: string;
  credentialName: string;
  credentialType: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action: string;
  dueDate?: string;
}

export interface BriefingItem {
  category: 'hot-req' | 'follow-up' | 'interview' | 'credential' | 'placement-checkin' | 'pipeline';
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  detail: string;
  action: string;
  dueDate?: string;
}

export interface CandidateFilter {
  skills?: string[];
  location?: { city?: string; state?: string; radius?: number };
  status?: string[];
  lastContactAfter?: string;
  lastContactBefore?: string;
  source?: string[];
  limit?: number;
}

export interface JobOrderFilter {
  status?: string[];
  priority?: string[];
  clientId?: string;
  recruiterAssigned?: string;
  createdAfter?: string;
  limit?: number;
}

export interface ATSAdapter {
  name: string;
  connected: boolean;
  getCandidates(filters?: CandidateFilter): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | null>;
  updateCandidateScore(candidateId: string, score: ScreeningResult): Promise<void>;
  getJobOrders(filters?: JobOrderFilter): Promise<JobOrder[]>;
  getJobOrder(id: string): Promise<JobOrder | null>;
  submitCandidate(submission: Submission): Promise<void>;
  getCredentials(candidateId?: string): Promise<Credential[]>;
  getPlacements(filters?: { status?: string[]; candidateId?: string }): Promise<Placement[]>;
}

export interface AgencyConfig {
  agencyName: string;
  agencyType: string;
  ats: {
    system: string;
    apiUrl?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
  teamSize: number;
  painPoints: string[];
  scoringRubric?: string;
}
