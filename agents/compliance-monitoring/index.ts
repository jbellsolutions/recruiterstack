#!/usr/bin/env tsx
/**
 * Compliance Monitoring Agent
 * Audits credentials, licenses, and certifications across the workforce.
 * Critical for healthcare staffing (NLC, Joint Commission, CMS).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { NLC_COMPACT_STATES, getRequiredCredentials } from './rules.js';
import { generateAlerts, formatComplianceReport } from './alerts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== RecruiterStack Compliance Monitoring Agent ===\n');

  const configPath = resolve(__dirname, '../../config/agency.json');
  let agencyType = 'healthcare';
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    agencyType = config.agencyType;
    console.log(`Agency: ${config.agencyName} (${agencyType})`);
  } else {
    console.log('No config found. Running demo with healthcare staffing data.');
  }

  // Demo credential data
  const today = new Date();
  const credentials = [
    { id: 'CR-001', candidateId: 'C-001', candidateName: 'Jennifer Martinez', type: 'license', name: 'RN License — Texas', state: 'TX', issueDate: '2022-04-15', expirationDate: '2026-04-15', status: 'expiring-soon' as const },
    { id: 'CR-002', candidateId: 'C-001', candidateName: 'Jennifer Martinez', type: 'certification', name: 'BLS Certification', issueDate: '2024-06-01', expirationDate: '2026-06-01', status: 'active' as const },
    { id: 'CR-003', candidateId: 'C-001', candidateName: 'Jennifer Martinez', type: 'certification', name: 'ACLS Certification', issueDate: '2024-06-01', expirationDate: '2026-04-10', status: 'expiring-soon' as const },
    { id: 'CR-004', candidateId: 'C-002', candidateName: 'David Kim', type: 'license', name: 'RN License — Texas', state: 'TX', issueDate: '2021-08-01', expirationDate: '2025-08-01', status: 'expired' as const },
    { id: 'CR-005', candidateId: 'C-002', candidateName: 'David Kim', type: 'certification', name: 'BLS Certification', issueDate: '2023-09-15', expirationDate: '2025-09-15', status: 'expired' as const },
    { id: 'CR-006', candidateId: 'C-003', candidateName: 'Amanda Foster', type: 'license', name: 'RN License — Texas', state: 'TX', issueDate: '2023-01-10', expirationDate: '2027-01-10', status: 'active' as const },
    { id: 'CR-007', candidateId: 'C-003', candidateName: 'Amanda Foster', type: 'certification', name: 'BLS Certification', issueDate: '2025-01-15', expirationDate: '2027-01-15', status: 'active' as const },
    { id: 'CR-008', candidateId: 'C-003', candidateName: 'Amanda Foster', type: 'background-check', name: 'Background Check', issueDate: '2024-03-01', status: 'active' as const },
    { id: 'CR-009', candidateId: 'C-004', candidateName: 'Robert Williams', type: 'license', name: 'RN License — Texas', state: 'TX', issueDate: '2022-11-01', expirationDate: '2026-11-01', status: 'active' as const },
    { id: 'CR-010', candidateId: 'C-004', candidateName: 'Robert Williams', type: 'certification', name: 'ACLS Certification', issueDate: '2023-05-01', expirationDate: '2025-05-01', status: 'expired' as const },
  ];

  console.log(`\nAuditing ${credentials.length} credentials across ${new Set(credentials.map(c => c.candidateId)).size} candidates\n`);

  const required = getRequiredCredentials(agencyType, 'TX');
  console.log(`Required credentials for ${agencyType} in TX: ${required.join(', ')}\n`);

  const alerts = generateAlerts(credentials, agencyType);
  console.log(formatComplianceReport(alerts, credentials));
}

main().catch(console.error);
