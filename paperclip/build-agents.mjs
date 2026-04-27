#!/usr/bin/env node
// Generates paperclip/agents/*.json from agents/*/SPEC.md.
// SPEC.md is the single source of truth; this just transcodes it for Paperclip plugin install.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUGS = [
  "resume-screening",
  "candidate-sourcing",
  "client-outreach",
  "interview-scheduling",
  "compliance-monitoring",
  "market-intelligence",
  "client-health",
  "recruiter-productivity",
  "post-placement",
  "daily-briefing",
];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2].trim() };
}

await fs.mkdir(path.join(ROOT, "paperclip", "agents"), { recursive: true });

for (const slug of SLUGS) {
  const specPath = path.join(ROOT, "agents", slug, "SPEC.md");
  const raw = await fs.readFile(specPath, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const json = {
    slug: meta.slug || slug,
    title: meta.title || slug,
    role: meta.role,
    reports_to: meta.reports_to,
    runtime: meta.runtime || "claude-code",
    schedule: meta.schedule || "on-demand",
    monthly_budget_usd: Number(meta.default_budget_usd || 25),
    persona: body,
    source_spec: `agents/${slug}/SPEC.md`,
  };
  const outPath = path.join(ROOT, "paperclip", "agents", `${slug}.json`);
  await fs.writeFile(outPath, JSON.stringify(json, null, 2) + "\n");
  console.log(`wrote ${path.relative(ROOT, outPath)}`);
}
