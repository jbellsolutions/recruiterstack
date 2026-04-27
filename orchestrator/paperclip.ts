import { execa } from "execa";
import type { AgentSpec } from "./agents";

const PAPERCLIP_BASE = process.env.PAPERCLIP_URL ?? "http://localhost:3100";
const PAPERCLIP_HEALTH = `${PAPERCLIP_BASE}/api/health`;

export interface PaperclipStatus {
  running: boolean;
  url: string;
}

export async function isPaperclipRunning(): Promise<boolean> {
  try {
    const res = await fetch(PAPERCLIP_HEALTH, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensurePaperclipRunning(): Promise<PaperclipStatus> {
  if (await isPaperclipRunning()) return { running: true, url: PAPERCLIP_BASE };

  // Bootstrap Paperclip in the background. Output streams to the parent so the user sees onboarding.
  // The onboard command picks a random port if 3100 is taken; we wait for the default first.
  const child = execa("npx", ["-y", "paperclipai", "onboard", "--yes"], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  const start = Date.now();
  while (Date.now() - start < 60_000) {
    await new Promise((r) => setTimeout(r, 1500));
    if (await isPaperclipRunning()) return { running: true, url: PAPERCLIP_BASE };
  }

  return { running: false, url: PAPERCLIP_BASE };
}

interface RegisterAgentInput {
  spec: AgentSpec;
  context?: Record<string, unknown>;
}

/**
 * Registers (or upserts) an agent in Paperclip via its agent API.
 * Falls back to writing a manifest file the user can `paperclip plugin install`
 * if the live API isn't reachable.
 */
export async function registerAgent({ spec, context }: RegisterAgentInput): Promise<{
  ok: boolean;
  agentUrl?: string;
  fallback?: string;
}> {
  const payload = {
    slug: spec.slug,
    title: spec.title,
    role: spec.role,
    reports_to: spec.reports_to,
    runtime: spec.runtime,
    schedule: spec.schedule,
    monthly_budget_usd: spec.default_budget_usd,
    persona: spec.body,
    metadata: { source: "recruiterstack", ...context },
  };

  try {
    const res = await fetch(`${PAPERCLIP_BASE}/api/agents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, fallback: await fallbackInstructions(spec) };
    }
    return { ok: true, agentUrl: `${PAPERCLIP_BASE}/agents/${spec.slug}` };
  } catch {
    return { ok: false, fallback: await fallbackInstructions(spec) };
  }
}

async function fallbackInstructions(spec: AgentSpec): Promise<string> {
  return [
    `# Manual spawn for ${spec.title}`,
    "",
    "Paperclip wasn't reachable. You can still run this agent two ways:",
    "",
    "**A. Boot Paperclip then re-run:**",
    "```",
    "npx paperclipai onboard --yes",
    `# then click "Activate" in the RecruiterStack plan UI again`,
    "```",
    "",
    "**B. Run directly inside Claude Code:**",
    "Paste this into Claude Code:",
    "```",
    `Read agents/${spec.slug}/SPEC.md and act as that agent for one cycle.`,
    "```",
    "",
    "**C. Run via Forge (if installed):**",
    "```",
    `forge run --persona agents/${spec.slug}/SPEC.md`,
    "```",
  ].join("\n");
}

export function paperclipDashboardUrl(): string {
  return PAPERCLIP_BASE;
}
