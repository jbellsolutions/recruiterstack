export const AUDIT_URL = "https://aiintegraterz.com/audit";
export const SOURCE_REPO = "recruiterstack";

export const AGENCY_TYPES = [
  { slug: "contingency", label: "Contingency Staffing", summary: "Fast-moving desks where speed-to-submit and submittal quality win the deal." },
  { slug: "retained-search", label: "Retained Search", summary: "High-trust searches where research depth, reporting, and candidate assessment matter." },
  { slug: "rpo", label: "RPO", summary: "Embedded recruiting teams that live or die by SLAs, reporting, and process consistency." },
  { slug: "temp-contract", label: "Temporary / Contract Staffing", summary: "High-volume operations balancing fill rate, payroll, timesheets, and worker retention." },
  { slug: "temp-to-perm", label: "Temp-to-Perm", summary: "Hybrid books where redeployment, conversion timing, and margin visibility drive outcomes." },
  { slug: "direct-hire", label: "Direct Hire", summary: "Placement-first firms focused on search speed, recruiter leverage, and close rates." },
  { slug: "executive-search", label: "Executive Search", summary: "Senior searches that depend on market mapping, research, and polished client communication." },
  { slug: "msp-vms", label: "MSP / VMS", summary: "Program-driven staffing operations managing suppliers, compliance, SLAs, and spend." },
  { slug: "sow", label: "SOW / Consulting Staffing", summary: "Project-based staffing where scope, milestones, and resource allocation must stay tight." },
  { slug: "payrolling-eor", label: "Payrolling / EOR", summary: "Back-office heavy models built around onboarding, payroll accuracy, and compliance." },
  { slug: "gig-platforms", label: "On-Demand / Gig Platforms", summary: "Marketplace-style staffing where response time, reliability, and matching speed are everything." },
  { slug: "hybrid", label: "Hybrid Staffing", summary: "Agencies combining multiple models that need cross-workflow visibility and prioritization." },
  { slug: "niche-boutique", label: "Niche / Boutique Agencies", summary: "Specialized firms winning through expertise, positioning, and deep candidate knowledge." },
  { slug: "offshore-nearshore", label: "Offshore / Nearshore Staffing", summary: "Distributed talent firms managing time zones, communication, and client confidence." },
  { slug: "healthcare", label: "Healthcare Staffing", summary: "Credential-heavy staffing where compliance, expirations, and audit readiness are mission-critical." },
  { slug: "it-tech", label: "IT / Tech Staffing", summary: "Skills-dense recruiting where matching, screening, and speed-to-submit create the edge." },
  { slug: "light-industrial", label: "Light Industrial Staffing", summary: "Volume staffing focused on shift coverage, no-shows, redeployment, and throughput." },
] as const;

export const PROBLEM_CATEGORIES = [
  { slug: "candidate-sourcing-pipeline", label: "Candidate Sourcing & Pipeline", summary: "Finding the right people faster and keeping the database fresh." },
  { slug: "screening-qualification", label: "Screening & Qualification", summary: "Ranking candidates, scoring fit, and reducing recruiter review time." },
  { slug: "client-acquisition-sales", label: "Client Acquisition & Sales", summary: "Winning more meetings, job orders, and client conversations." },
  { slug: "job-matching-placement", label: "Job Matching & Placement", summary: "Getting from req to shortlist to placement with less friction." },
  { slug: "compliance-legal", label: "Compliance & Legal", summary: "Managing I-9s, certifications, expirations, and audit prep." },
  { slug: "onboarding-offboarding", label: "Onboarding & Offboarding", summary: "Making starts smoother and reducing manual handoffs." },
  { slug: "billing-payroll-back-office", label: "Billing, Payroll & Back Office", summary: "Tightening timesheets, invoicing, margins, and payroll workflows." },
  { slug: "communication-follow-up", label: "Communication & Follow-Up", summary: "Automating reminders, status updates, and nurture sequences." },
  { slug: "reporting-analytics", label: "Reporting & Analytics", summary: "Turning scattered data into clear recruiter, client, and leadership visibility." },
  { slug: "candidate-experience", label: "Candidate Experience", summary: "Keeping candidates informed, engaged, and less likely to ghost." },
  { slug: "client-retention", label: "Client Retention", summary: "Protecting existing accounts with better visibility and proactive service." },
  { slug: "market-intelligence", label: "Market Intelligence", summary: "Using salary, demand, and competitor data to price and position better." },
  { slug: "internal-operations", label: "Internal Operations", summary: "Reducing recruiter burnout and removing admin bottlenecks." },
] as const;
