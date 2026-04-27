import { isKnownAgent, loadAgentSpec, type AgentSlug } from "./agents";
import {
  ensurePaperclipRunning,
  paperclipDashboardUrl,
  registerAgent,
} from "./paperclip";

export interface SpawnResult {
  dashboardUrl: string;
  paperclipRunning: boolean;
  spawned: { slug: string; ok: boolean; agentUrl?: string }[];
  fallbacks: { slug: string; instructions: string }[];
}

export interface SpawnInput {
  agents: string[];
  context?: Record<string, unknown>;
}

export async function spawnAgents({ agents, context }: SpawnInput): Promise<SpawnResult> {
  const slugs: AgentSlug[] = agents.filter(isKnownAgent);

  const status = await ensurePaperclipRunning();
  const dashboardUrl = paperclipDashboardUrl();

  if (!status.running) {
    // Paperclip didn't come up — emit fallback instructions for every requested agent.
    const fallbacks = await Promise.all(
      slugs.map(async (slug) => {
        const spec = await loadAgentSpec(slug);
        const result = await registerAgent({ spec, context });
        return {
          slug,
          instructions: result.fallback ?? "(no instructions)",
        };
      }),
    );
    return {
      dashboardUrl,
      paperclipRunning: false,
      spawned: slugs.map((slug) => ({ slug, ok: false })),
      fallbacks,
    };
  }

  const spawned: SpawnResult["spawned"] = [];
  const fallbacks: SpawnResult["fallbacks"] = [];

  for (const slug of slugs) {
    const spec = await loadAgentSpec(slug);
    const res = await registerAgent({ spec, context });
    if (res.ok) {
      spawned.push({ slug, ok: true, agentUrl: res.agentUrl });
    } else {
      spawned.push({ slug, ok: false });
      if (res.fallback) fallbacks.push({ slug, instructions: res.fallback });
    }
  }

  return {
    dashboardUrl,
    paperclipRunning: true,
    spawned,
    fallbacks,
  };
}
