#!/usr/bin/env tsx
/**
 * Resume Screening Agent
 * Scores and ranks candidates against job requirements using a two-tier system:
 * - Tier 1 (Haiku): Fast filter for obvious matches/mismatches
 * - Tier 2 (Sonnet): Deep analysis for borderline candidates
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types inline to avoid import issues during development
interface Candidate {
  id: string; firstName: string; lastName: string; email: string;
  phone: string; skills: string[]; experience: { title: string; company: string; startDate: string; endDate?: string; current: boolean; description: string }[];
  education: { degree: string; field: string; institution: string; graduationDate?: string }[];
  location: { city: string; state: string }; resumeText?: string; source: string; status: string;
}

interface JobOrder {
  id: string; title: string; clientName: string; description: string; requirements: string;
  mustHaveSkills: string[]; niceToHaveSkills: string[];
  location: { city: string; state: string; remote?: boolean };
  openings: number; priority: string; status: string; createdDate: string;
}

interface ScreeningResult {
  candidateId: string; candidateName: string; overallScore: number;
  dimensions: { skillsMatch: number; experienceDepth: number; industryFit: number; locationFit: number; availability: number };
  recommendation: 'submit' | 'maybe' | 'pass';
  reasoning: string; keyStrengths: string[]; concerns: string[];
}

// Load scoring rubric
function loadRubric(agencyType?: string): Record<string, number> {
  const rubricPath = resolve(__dirname, '../../config/scoring-rubrics', `${agencyType || 'general'}.json`);
  if (existsSync(rubricPath)) {
    const rubric = JSON.parse(readFileSync(rubricPath, 'utf-8'));
    return Object.fromEntries(Object.entries(rubric.dimensions).map(([k, v]: [string, any]) => [k, v.weight]));
  }
  return { skillsMatch: 30, experienceDepth: 25, industryFit: 20, locationFit: 15, availability: 10 };
}

// Build screening prompt
function buildPrompt(candidate: Candidate, jobOrder: JobOrder, weights: Record<string, number>): string {
  const expSummary = candidate.experience.map(e =>
    `${e.title} at ${e.company} (${e.startDate}–${e.endDate || 'present'}): ${e.description}`
  ).join('\n');

  return `You are a senior recruiting specialist. Score this candidate against the job order.

CANDIDATE:
Name: ${candidate.firstName} ${candidate.lastName}
Skills: ${candidate.skills.join(', ')}
Location: ${candidate.location.city}, ${candidate.location.state}

EXPERIENCE:
${expSummary}

JOB ORDER:
Title: ${jobOrder.title}
Client: ${jobOrder.clientName}
Requirements: ${jobOrder.requirements}
Must-Have Skills: ${jobOrder.mustHaveSkills.join(', ')}
Nice-to-Have: ${jobOrder.niceToHaveSkills.join(', ')}
Location: ${jobOrder.location.city}, ${jobOrder.location.state}${jobOrder.location.remote ? ' (Remote OK)' : ''}

SCORING (weights):
${Object.entries(weights).map(([k, v]) => `- ${k}: ${v}%`).join('\n')}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "dimensions": { "skillsMatch": <0-100>, "experienceDepth": <0-100>, "industryFit": <0-100>, "locationFit": <0-100>, "availability": <0-100> },
  "recommendation": "submit" | "maybe" | "pass",
  "reasoning": "<2-3 sentences>",
  "keyStrengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>"]
}

Score 70+ = submit, 40-69 = maybe, below 40 = pass.`;
}

// Parse Claude's JSON response
function parseResponse(text: string): Partial<ScreeningResult> | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch { return null; }
}

// Format results as markdown report
function formatReport(results: ScreeningResult[], jobOrder: JobOrder): string {
  const lines: string[] = [
    `# Resume Screening Report`,
    `**Job Order:** ${jobOrder.title} at ${jobOrder.clientName}`,
    `**Candidates Screened:** ${results.length}`,
    `**Date:** ${new Date().toLocaleDateString()}`,
    '',
    '## Results',
    '',
    '| Rank | Candidate | Score | Rec | Key Strengths | Concerns |',
    '|------|-----------|-------|-----|---------------|----------|',
  ];

  results.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.candidateName} | ${r.overallScore}/100 | ${r.recommendation.toUpperCase()} | ${r.keyStrengths.join('; ')} | ${r.concerns.join('; ')} |`);
  });

  lines.push('', '## Detailed Scores', '');
  results.forEach(r => {
    lines.push(`### ${r.candidateName} — ${r.overallScore}/100 (${r.recommendation.toUpperCase()})`);
    lines.push(`- Skills Match: ${r.dimensions.skillsMatch}/100`);
    lines.push(`- Experience: ${r.dimensions.experienceDepth}/100`);
    lines.push(`- Industry Fit: ${r.dimensions.industryFit}/100`);
    lines.push(`- Location: ${r.dimensions.locationFit}/100`);
    lines.push(`- Availability: ${r.dimensions.availability}/100`);
    lines.push(`- **Reasoning:** ${r.reasoning}`);
    lines.push('');
  });

  const submitCount = results.filter(r => r.recommendation === 'submit').length;
  const maybeCount = results.filter(r => r.recommendation === 'maybe').length;
  lines.push('## Summary');
  lines.push(`- **Submit:** ${submitCount} candidates`);
  lines.push(`- **Maybe:** ${maybeCount} candidates`);
  lines.push(`- **Pass:** ${results.length - submitCount - maybeCount} candidates`);

  return lines.join('\n');
}

// Main — works with mock data or real ATS
async function main() {
  console.log('\n=== RecruiterStack Resume Screening Agent ===\n');

  // Load config
  const configPath = resolve(__dirname, '../../config/agency.json');
  let agencyType = 'general';
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    agencyType = config.agencyType || 'general';
    console.log(`Agency: ${config.agencyName} (${config.agencyType})`);
  } else {
    console.log('No agency config found. Running with defaults. Run /setup to configure.');
  }

  const weights = loadRubric(agencyType);
  console.log(`Scoring rubric: ${agencyType}`);
  console.log(`Weights: ${JSON.stringify(weights)}\n`);

  // For demo/CLI mode, use inline sample data
  const sampleJobOrder: JobOrder = {
    id: 'JO-001', title: 'Senior Software Engineer', clientName: 'TechCorp Inc',
    description: 'Looking for a senior engineer to lead backend development',
    requirements: '5+ years experience, Python or Node.js, cloud infrastructure, team leadership',
    mustHaveSkills: ['Python', 'AWS', 'REST APIs', 'SQL'],
    niceToHaveSkills: ['Kubernetes', 'GraphQL', 'Team Leadership', 'CI/CD'],
    location: { city: 'Austin', state: 'TX', remote: true },
    openings: 1, priority: 'high', status: 'open', createdDate: '2026-03-25'
  };

  const sampleCandidates: Candidate[] = [
    {
      id: 'C-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@email.com', phone: '555-0101',
      skills: ['Python', 'AWS', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'REST APIs'],
      experience: [
        { title: 'Senior Software Engineer', company: 'DataFlow Systems', startDate: '2021-03', current: true, description: 'Lead backend team of 8 engineers. Built microservices architecture processing 2M requests/day. Migrated from monolith to AWS ECS.' },
        { title: 'Software Engineer', company: 'StartupXYZ', startDate: '2018-06', endDate: '2021-02', current: false, description: 'Full-stack development with Python/Django and React. Built REST APIs serving mobile and web clients.' }
      ],
      education: [{ degree: 'BS', field: 'Computer Science', institution: 'UT Austin', graduationDate: '2018-05' }],
      location: { city: 'Austin', state: 'TX' }, source: 'ats', status: 'active'
    },
    {
      id: 'C-002', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@email.com', phone: '555-0102',
      skills: ['Java', 'Spring Boot', 'AWS', 'MySQL', 'REST APIs', 'Microservices'],
      experience: [
        { title: 'Backend Developer', company: 'Enterprise Solutions LLC', startDate: '2020-01', current: true, description: 'Develop and maintain Java Spring Boot microservices. AWS Lambda and API Gateway integration.' },
        { title: 'Junior Developer', company: 'CodeShop', startDate: '2018-08', endDate: '2019-12', current: false, description: 'Full-stack Java development. Built internal tools and REST APIs.' }
      ],
      education: [{ degree: 'BS', field: 'Information Technology', institution: 'Texas State', graduationDate: '2018-05' }],
      location: { city: 'San Antonio', state: 'TX' }, source: 'ats', status: 'active'
    },
    {
      id: 'C-003', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@email.com', phone: '555-0103',
      skills: ['Python', 'FastAPI', 'AWS', 'PostgreSQL', 'GraphQL', 'Docker', 'Terraform', 'CI/CD'],
      experience: [
        { title: 'Staff Engineer', company: 'CloudNative Corp', startDate: '2019-06', current: true, description: 'Architected cloud-native platform serving 500K users. Led migration to Kubernetes. Managed team of 12 engineers across 3 squads.' },
        { title: 'Senior Engineer', company: 'FinTech Partners', startDate: '2016-03', endDate: '2019-05', current: false, description: 'Built high-throughput payment processing APIs in Python. SOC 2 compliance. 99.99% uptime SLA.' }
      ],
      education: [{ degree: 'MS', field: 'Computer Science', institution: 'Georgia Tech', graduationDate: '2016-05' }],
      location: { city: 'Denver', state: 'CO' }, source: 'linkedin', status: 'active'
    }
  ];

  console.log(`Job Order: ${sampleJobOrder.title} at ${sampleJobOrder.clientName}`);
  console.log(`Candidates to screen: ${sampleCandidates.length}\n`);
  console.log('Note: In production, this connects to your ATS via the adapter layer.');
  console.log('Currently running with sample data.\n');
  console.log('--- Screening Results (simulated without API call) ---\n');

  // Simulated results for demo (in production, each candidate gets sent to Claude)
  const results: ScreeningResult[] = [
    {
      candidateId: 'C-003', candidateName: 'Priya Patel', overallScore: 92,
      dimensions: { skillsMatch: 95, experienceDepth: 95, industryFit: 85, locationFit: 80, availability: 90 },
      recommendation: 'submit', reasoning: 'Strong Python/AWS match with 10 years experience. Led team of 12 — exceeds leadership requirement. GraphQL and Kubernetes are bonus skills. Remote-friendly role mitigates Denver location.',
      keyStrengths: ['Exact tech stack match', 'Team leadership (12 engineers)', 'Cloud-native architecture expertise'],
      concerns: ['Based in Denver, not Austin (mitigated by remote option)']
    },
    {
      candidateId: 'C-001', candidateName: 'Sarah Chen', overallScore: 88,
      dimensions: { skillsMatch: 90, experienceDepth: 85, industryFit: 80, locationFit: 100, availability: 85 },
      recommendation: 'submit', reasoning: 'Strong Python/AWS skills with 5+ years. Currently leads team of 8 — solid leadership signal. Located in Austin. Kubernetes experience is a plus.',
      keyStrengths: ['Python/AWS/Docker stack', 'Team lead experience (8 engineers)', 'Austin-based — perfect location fit'],
      concerns: ['5 years vs. 10 years for the other top candidate']
    },
    {
      candidateId: 'C-002', candidateName: 'Marcus Johnson', overallScore: 52,
      dimensions: { skillsMatch: 45, experienceDepth: 50, industryFit: 55, locationFit: 70, availability: 60 },
      recommendation: 'maybe', reasoning: 'Java background, not Python — would require language transition. Has AWS and REST API experience which transfers well. No team leadership experience. San Antonio is close to Austin.',
      keyStrengths: ['AWS experience', 'REST API development', 'Near Austin location'],
      concerns: ['Java, not Python — language mismatch', 'No leadership experience', 'Only 6 years total experience']
    }
  ];

  console.log(formatReport(results, sampleJobOrder));
  console.log('\n--- End of Screening Report ---');
  console.log('\nTo run with live ATS data, configure your ATS via /setup');
  console.log('To adjust scoring weights, edit config/scoring-rubrics/');
}

main().catch(console.error);
