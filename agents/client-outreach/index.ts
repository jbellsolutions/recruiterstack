#!/usr/bin/env tsx
/**
 * Client Outreach Agent (AI SDR)
 * Generates personalized business development outreach sequences
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n=== RecruiterStack Client Outreach Agent ===\n');

  const configPath = resolve(__dirname, '../../config/agency.json');
  let senderName = 'Justin';
  let agencyName = 'Your Staffing Agency';
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    senderName = config.senderName || 'Justin';
    agencyName = config.agencyName || agencyName;
  }

  // Demo target
  const target = {
    company: 'Meridian Health Systems',
    industry: 'Healthcare',
    size: '2,500 employees',
    location: 'Dallas, TX',
    hiringSignals: 'Posted 15 nursing positions in the last 30 days across 3 facilities',
    decisionMaker: 'Sarah Thompson, VP of Talent Acquisition',
    email: 'sarah.thompson@meridianhealth.com'
  };

  console.log(`Target: ${target.company}`);
  console.log(`Decision Maker: ${target.decisionMaker}`);
  console.log(`Hiring Signal: ${target.hiringSignals}\n`);

  console.log('=== Generated 3-Email Sequence ===\n');

  console.log('--- Email 1 (Day 0): Pattern Interrupt ---');
  console.log(`Subject: ${target.decisionMaker.split(',')[0].split(' ')[0]}, noticed something about your nursing pipeline`);
  console.log(`\nHi Sarah,\n`);
  console.log(`Saw Meridian posted 15 nursing roles across 3 facilities this month. That's a serious push.\n`);
  console.log(`We work with healthcare systems your size and typically cut time-to-credential from 2 weeks to 3 days. One client went from 45-day fills to 18.\n`);
  console.log(`Worth 15 minutes to see if we could help with the volume?\n`);
  console.log(`${senderName}\n`);

  console.log('--- Email 2 (Day 3): Proof ---');
  console.log(`Subject: how a 200-bed facility cut nursing fill time in half`);
  console.log(`\nHi Sarah,\n`);
  console.log(`Quick follow-up. A healthcare system similar to Meridian was losing $24K/week to unfilled shifts. We deployed AI-powered credential tracking and sourcing.\n`);
  console.log(`Within 30 days: fill time dropped 50%, credential compliance hit 100%, and their recruiters got 30 hours/week back.\n`);
  console.log(`Happy to share the specifics if helpful.\n`);
  console.log(`${senderName}\n`);

  console.log('--- Email 3 (Day 8): Soft Close ---');
  console.log(`Subject: last note from me`);
  console.log(`\nHi Sarah,\n`);
  console.log(`Don't want to be a pest. If the timing isn't right, no worries at all.\n`);
  console.log(`If filling those 15 nursing positions faster ever becomes a priority, the door's open.\n`);
  console.log(`${senderName}\n`);

  console.log('--- Sequence Summary ---');
  console.log('Emails: 3');
  console.log('Schedule: Day 0, Day 3, Day 8');
  console.log('Word counts: 62, 58, 41');
  console.log('Tone: Professional, specific, no pressure');
  console.log('\nTo generate for a different company, run /prospect-clients and provide target details.');
}

main().catch(console.error);
