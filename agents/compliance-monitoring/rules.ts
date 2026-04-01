/**
 * Compliance Rules — State-by-state requirements for staffing
 */

// Nurse Licensure Compact (NLC) states as of 2026
export const NLC_COMPACT_STATES = [
  'AL', 'AZ', 'AR', 'CO', 'DE', 'FL', 'GA', 'ID', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MS', 'MO', 'MT', 'NE', 'NH',
  'NJ', 'NM', 'NC', 'ND', 'OH', 'OK', 'SC', 'SD', 'TN', 'TX',
  'UT', 'VA', 'VT', 'WA', 'WV', 'WI', 'WY', 'DC', 'GU', 'VI', 'MP'
];

export const NON_COMPACT_STATES = [
  'AK', 'CA', 'CT', 'HI', 'IL', 'MA', 'MI', 'MN', 'NV', 'NY',
  'OR', 'PA', 'RI'
];

interface CredentialRequirement {
  name: string;
  type: string;
  required: boolean;
  renewalPeriod?: string;
  notes?: string;
}

const HEALTHCARE_REQUIREMENTS: CredentialRequirement[] = [
  { name: 'RN/LPN License', type: 'license', required: true, renewalPeriod: '2-4 years', notes: 'State-specific. NLC multistate license valid in compact states.' },
  { name: 'BLS Certification', type: 'certification', required: true, renewalPeriod: '2 years', notes: 'American Heart Association preferred' },
  { name: 'ACLS Certification', type: 'certification', required: true, renewalPeriod: '2 years', notes: 'Required for ICU, ER, and most acute care' },
  { name: 'Background Check', type: 'background-check', required: true, renewalPeriod: '1 year', notes: 'State and federal criminal background' },
  { name: 'Drug Screen', type: 'drug-test', required: true, renewalPeriod: 'Per assignment', notes: '10-panel standard' },
  { name: 'TB Test', type: 'health-screen', required: true, renewalPeriod: '1 year', notes: 'PPD or QuantiFERON' },
  { name: 'Physical Exam', type: 'health-screen', required: true, renewalPeriod: '1 year' },
  { name: 'I-9 Verification', type: 'i9', required: true, notes: 'Required for all US employment' },
];

const IT_REQUIREMENTS: CredentialRequirement[] = [
  { name: 'Background Check', type: 'background-check', required: true, renewalPeriod: '1 year' },
  { name: 'I-9 Verification', type: 'i9', required: true },
  { name: 'Drug Screen', type: 'drug-test', required: false, notes: 'Client-dependent' },
];

const INDUSTRIAL_REQUIREMENTS: CredentialRequirement[] = [
  { name: 'Background Check', type: 'background-check', required: true, renewalPeriod: '1 year' },
  { name: 'I-9 Verification', type: 'i9', required: true },
  { name: 'Drug Screen', type: 'drug-test', required: true, renewalPeriod: 'Per assignment' },
  { name: 'OSHA Safety Training', type: 'certification', required: true, renewalPeriod: '1 year' },
  { name: 'Forklift License', type: 'license', required: false, renewalPeriod: '3 years', notes: 'If operating powered industrial trucks' },
];

const GENERAL_REQUIREMENTS: CredentialRequirement[] = [
  { name: 'Background Check', type: 'background-check', required: true, renewalPeriod: '1 year' },
  { name: 'I-9 Verification', type: 'i9', required: true },
];

export function getRequiredCredentials(agencyType: string, state?: string): string[] {
  let reqs: CredentialRequirement[];
  switch (agencyType) {
    case 'healthcare': reqs = HEALTHCARE_REQUIREMENTS; break;
    case 'it-tech': reqs = IT_REQUIREMENTS; break;
    case 'light-industrial': reqs = INDUSTRIAL_REQUIREMENTS; break;
    default: reqs = GENERAL_REQUIREMENTS;
  }
  return reqs.filter(r => r.required).map(r => r.name);
}

export function isNLCState(state: string): boolean {
  return NLC_COMPACT_STATES.includes(state.toUpperCase());
}
