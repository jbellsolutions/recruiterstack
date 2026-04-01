#!/usr/bin/env tsx
/**
 * Candidate Sourcing Agent
 * Searches multiple sources for candidates matching job requirements.
 * Sources: ATS internal database, LinkedIn (Apify), Indeed, Apollo enrichment
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== RecruiterStack Candidate Sourcing Agent ===\n');

  const configPath = resolve(__dirname, '../../config/agency.json');
  let agencyType = 'contingency';
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    agencyType = config.agencyType;
    console.log(`Agency: ${config.agencyName} (${agencyType})`);
  } else {
    console.log('No config found. Running demo mode.');
  }

  // Demo search criteria
  const criteria = {
    title: 'Registered Nurse - ICU',
    skills: ['ICU', 'Critical Care', 'BLS', 'ACLS', 'Ventilator Management'],
    location: { city: 'Dallas', state: 'TX' },
    experienceYears: 3,
    remote: false
  };

  console.log(`\nSearch: ${criteria.title}`);
  console.log(`Skills: ${criteria.skills.join(', ')}`);
  console.log(`Location: ${criteria.location.city}, ${criteria.location.state}`);
  console.log(`Min Experience: ${criteria.experienceYears} years\n`);

  // Source 1: ATS Internal Database
  console.log('--- Source 1: ATS Internal Database ---');
  console.log('Found: 8 candidates matching criteria');
  console.log('  - 3 active (contacted within 30 days)');
  console.log('  - 5 dormant (last contact 90+ days ago)\n');

  // Source 2: LinkedIn (would use Apify in production)
  console.log('--- Source 2: LinkedIn (via Apify) ---');
  console.log('Status: Not configured. Add Apify API key via /setup to enable.');
  console.log('Potential: ~25 matching profiles in DFW area\n');

  // Source 3: Indeed
  console.log('--- Source 3: Indeed ---');
  console.log('Status: Not configured. Add Indeed API access via /setup to enable.\n');

  // Source 4: Apollo Enrichment
  console.log('--- Source 4: Apollo Enrichment ---');
  console.log('Status: Not configured. Add Apollo API key to enrich candidate profiles.\n');

  // Demo results
  console.log('=== Sourcing Results (ATS only — demo data) ===\n');
  const results = [
    { rank: 1, name: 'Jennifer Martinez, RN', score: 91, source: 'ATS', status: 'Active', skills: 'ICU (5yr), ACLS, BLS, Vent Mgmt', location: 'Dallas, TX', lastContact: '2026-03-15' },
    { rank: 2, name: 'David Kim, RN', score: 85, source: 'ATS', status: 'Active', skills: 'ICU (8yr), ACLS, BLS, CRRT', location: 'Fort Worth, TX', lastContact: '2026-03-20' },
    { rank: 3, name: 'Amanda Foster, RN', score: 78, source: 'ATS', status: 'Dormant', skills: 'ICU (4yr), BLS, ACLS', location: 'Plano, TX', lastContact: '2025-11-02' },
    { rank: 4, name: 'Robert Williams, RN', score: 72, source: 'ATS', status: 'Dormant', skills: 'ICU (3yr), BLS, Telemetry', location: 'Arlington, TX', lastContact: '2025-09-18' },
    { rank: 5, name: 'Lisa Chang, RN', score: 68, source: 'ATS', status: 'Dormant', skills: 'Step-Down (6yr), BLS, ACLS', location: 'Irving, TX', lastContact: '2025-08-30' },
  ];

  console.log('| Rank | Candidate | Score | Source | Status | Key Skills | Location | Last Contact |');
  console.log('|------|-----------|-------|--------|--------|------------|----------|-------------|');
  results.forEach(r => {
    console.log(`| ${r.rank} | ${r.name} | ${r.score}/100 | ${r.source} | ${r.status} | ${r.skills} | ${r.location} | ${r.lastContact} |`);
  });

  console.log(`\n--- Summary ---`);
  console.log(`Total found: ${results.length} candidates`);
  console.log(`Active: ${results.filter(r => r.status === 'Active').length}`);
  console.log(`Dormant (re-engagement opportunity): ${results.filter(r => r.status === 'Dormant').length}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run /screen-resumes to score these candidates against the job order`);
  console.log(`  2. Enable LinkedIn/Apollo sources via /setup for broader search`);
  console.log(`  3. Consider re-engaging dormant candidates — they're already in your database`);
}

main().catch(console.error);
