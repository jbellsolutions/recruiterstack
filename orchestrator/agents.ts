import { promises as fs } from "node:fs";
import path from "node:path";

export interface AgentSpec {
  slug: string;
  title: string;
  role: string;
  reports_to: string;
  default_budget_usd: number;
  schedule: string;
  runtime: string;
  body: string;
}

const AGENTS_DIR = path.join(process.cwd(), "agents");

const KNOWN_SLUGS = [
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
] as const;

export type AgentSlug = (typeof KNOWN_SLUGS)[number];

export function isKnownAgent(slug: string): slug is AgentSlug {
  return (KNOWN_SLUGS as readonly string[]).includes(slug);
}

export function knownAgentSlugs(): readonly AgentSlug[] {
  return KNOWN_SLUGS;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2] };
}

export async function loadAgentSpec(slug: AgentSlug): Promise<AgentSpec> {
  const file = path.join(AGENTS_DIR, slug, "SPEC.md");
  const raw = await fs.readFile(file, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug: meta.slug || slug,
    title: meta.title || slug,
    role: meta.role || "Agent",
    reports_to: meta.reports_to || "head-of-operations",
    default_budget_usd: Number(meta.default_budget_usd ?? 25),
    schedule: meta.schedule || "on-demand",
    runtime: meta.runtime || "claude-code",
    body: body.trim(),
  };
}

export async function loadAllAgentSpecs(): Promise<AgentSpec[]> {
  return Promise.all(KNOWN_SLUGS.map((slug) => loadAgentSpec(slug)));
}

export async function loadPainToAgentMap(): Promise<Record<string, string[]>> {
  const file = path.join(process.cwd(), "config", "pain-to-agent.json");
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (k.startsWith("$")) continue;
    if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string");
  }
  return out;
}

export async function recommendAgentsFor(problemSlugs: string[]): Promise<AgentSlug[]> {
  const map = await loadPainToAgentMap();
  const set = new Set<string>();
  for (const p of problemSlugs) {
    for (const a of map[p] ?? []) set.add(a);
  }
  return Array.from(set).filter(isKnownAgent);
}
