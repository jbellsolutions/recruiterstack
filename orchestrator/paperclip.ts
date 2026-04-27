import { execa } from "execa";
import path from "node:path";
import type { AgentSpec } from "./agents";

const PAPERCLIP_BASE = process.env.PAPERCLIP_URL ?? "http://localhost:3100";
const PAPERCLIP_HEALTH = `${PAPERCLIP_BASE}/api/health`;

interface PaperclipCompany {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
}

async function activeCompanyId(): Promise<string | null> {
  // Explicit override wins. Useful when the user has multiple Paperclip
  // companies and wants RecruiterStack agents pinned to a specific one.
  const override = process.env.PAPERCLIP_COMPANY_ID?.trim();
  if (override) return override;

  try {
    const res = await fetch(`${PAPERCLIP_BASE}/api/companies`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as PaperclipCompany[] | { companies?: PaperclipCompany[] };
    const list = Array.isArray(body) ? body : body.companies ?? [];
    // Prefer a company explicitly named for this product, then any active one.
    const named = list.find(
      (c) => c.name?.toLowerCase().includes("recruiterstack") && c.status === "active",
    );
    const active = list.find((c) => c.status === "active");
    return named?.id ?? active?.id ?? list[0]?.id ?? null;
  } catch {
    return null;
  }
}

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
  const companyId = await activeCompanyId();
  if (!companyId) {
    return { ok: false, fallback: await fallbackInstructions(spec) };
  }

  const repoRoot = process.cwd();
  const specPath = path.join(repoRoot, "agents", spec.slug, "SPEC.md");

  // See packages/shared/src/validators/agent.ts in paperclipai/paperclip:
  //   name (req), title, role (enum: ceo|cto|...|general — defaults to "general"),
  //   reportsTo (UUID|null), capabilities (string), adapterType (req),
  //   adapterConfig (record), budgetMonthlyCents (int), metadata (record).
  const payload = {
    name: spec.title,
    title: spec.title,
    role: "general" as const,
    reportsTo: null,
    capabilities: spec.role,
    adapterType: "claude_local",
    adapterConfig: {
      cwd: repoRoot,
      instructionsFilePath: specPath,
      // Safe-by-default: each Claude Code action prompts for permission inside Paperclip.
      // Users can flip this to true per-agent in the Paperclip UI once they trust the agent.
      dangerouslySkipPermissions: false,
    },
    budgetMonthlyCents: Math.round(spec.default_budget_usd * 100),
    metadata: {
      source: "recruiterstack",
      slug: spec.slug,
      schedule: spec.schedule,
      reportsToRole: spec.reports_to,
      ...context,
    },
  };

  try {
    const res = await fetch(`${PAPERCLIP_BASE}/api/companies/${companyId}/agents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, fallback: await fallbackInstructions(spec) };
    }
    const created = (await res.json()) as { id?: string };
    const agentUrl = created?.id
      ? `${PAPERCLIP_BASE}/companies/${companyId}/agents/${created.id}`
      : `${PAPERCLIP_BASE}`;
    return { ok: true, agentUrl };
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
