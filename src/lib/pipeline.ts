import { runAgent } from "./agent-runner";
import { getProject, updateProject, addLog, getArtifact, saveArtifact } from "./db";
import { ensureWorkspace } from "./workspace";
import { PLAYBOOKS, TEAM_CHARTER } from "./playbooks";

// Active pipelines tracked for cancellation
const activePipelines = new Map<string, AbortController>();

export function isPipelineRunning(slug: string): boolean {
  return activePipelines.has(slug);
}

export function cancelPipeline(slug: string): boolean {
  const controller = activePipelines.get(slug);
  if (controller) {
    controller.abort();
    activePipelines.delete(slug);
    return true;
  }
  return false;
}

interface PhaseConfig {
  name: string;
  number: number;
  agent: string;
  playbook: string;
}

const PHASES: PhaseConfig[] = [
  { name: "planning", number: 2, agent: "Meridian", playbook: "meridian" },
  { name: "architecture", number: 3, agent: "Forge", playbook: "forge" },
  { name: "design", number: 3, agent: "Palette", playbook: "palette" },
  { name: "scaffold", number: 4, agent: "Conduit", playbook: "conduit" },
  { name: "implementation", number: 5, agent: "Coder-1", playbook: "coder" },
  { name: "review", number: 6, agent: "Forge", playbook: "forge" },
  { name: "qa", number: 6, agent: "Sentinel", playbook: "sentinel" },
  { name: "deploy", number: 7, agent: "Conduit", playbook: "conduit" },
  { name: "delivery", number: 7, agent: "Atlas", playbook: "atlas" },
];

export async function runPipeline(slug: string): Promise<void> {
  const controller = new AbortController();
  activePipelines.set(slug, controller);

  try {
    const project = await getProject(slug);
    if (!project) throw new Error(`Project ${slug} not found`);

    await addLog({ project_slug: slug, agent_name: "Pipeline", message: `Pipeline started for: ${project.name}` });
    await updateProject(slug, { status: "active", health: "green" });

    const workspacePath = ensureWorkspace(slug);

    // Seed artifacts so agents can access project data
    if (project.brief) {
      await saveArtifact({ project_slug: slug, artifact_type: `${slug}-brief`, content: project.brief, created_by: "Pipeline" });
    }
    await saveArtifact({
      project_slug: slug,
      artifact_type: "defaults",
      content: JSON.stringify({
        min_health_score: 90,
        max_qa_iterations: 5,
        deploy_target: "railway",
        tech_stack: { framework: "next.js", language: "typescript", styling: "tailwind", testing: "vitest" },
      }),
      created_by: "Pipeline",
    });

    for (const phase of PHASES) {
      if (controller.signal.aborted) break;

      await updateProject(slug, {
        current_phase: phase.name,
        phase_number: phase.number,
      });

      await addLog({
        project_slug: slug,
        agent_name: "Pipeline",
        message: `Phase ${phase.number}: ${phase.name} → ${phase.agent}`,
      });

      // Build project state context for the agent
      const spec = await getArtifact(slug, "spec");
      const arch = await getArtifact(slug, "architecture");
      const design = await getArtifact(slug, "design");
      const impl = await getArtifact(slug, "implementation");
      const qa = await getArtifact(slug, "qa_report");

      const projectState = JSON.stringify({
        slug: project.slug,
        name: project.name,
        brief: project.brief,
        phase: phase.name,
        artifacts: {
          spec: spec ? "(available — use get_artifact to read)" : null,
          architecture: arch ? "(available — use get_artifact to read)" : null,
          design: design ? "(available — use get_artifact to read)" : null,
          implementation: impl ? "(available — use get_artifact to read)" : null,
          qa_report: qa ? "(available — use get_artifact to read)" : null,
        },
      });

      const playbook = PLAYBOOKS[phase.playbook as keyof typeof PLAYBOOKS];
      if (!playbook) throw new Error(`Playbook not found: ${phase.playbook}`);

      // QA fix loop — retry up to 5 times
      const maxRetries = phase.name === "qa" ? 5 : 1;
      let completed = false;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (controller.signal.aborted) break;

        if (phase.name === "qa" && attempt > 1) {
          await addLog({
            project_slug: slug,
            agent_name: "Pipeline",
            message: `QA iteration ${attempt}/${maxRetries}`,
          });
        }

        const result = await runAgent({
          projectSlug: slug,
          agentName: phase.agent,
          playbook,
          teamCharter: TEAM_CHARTER,
          projectState,
          phase: phase.name,
          provider: project.provider as "anthropic" | "openrouter",
          model: project.model,
          workspacePath,
          signal: controller.signal,
        });

        if (result.completed) {
          completed = true;
          break;
        }

        if (result.error) {
          await addLog({
            project_slug: slug,
            agent_name: "Pipeline",
            level: "error",
            message: `${phase.agent} error in ${phase.name}: ${result.error}`,
          });

          if (phase.name !== "qa") {
            // Non-QA phases don't retry — mark blocked
            await updateProject(slug, { status: "blocked", health: "red", error: result.error });
            return;
          }
        }
      }

      if (!completed && phase.name === "qa") {
        await addLog({
          project_slug: slug,
          agent_name: "Pipeline",
          level: "warn",
          message: "QA exhausted after 5 iterations. Proceeding to deploy with known issues.",
        });
      }
    }

    // Pipeline complete
    await updateProject(slug, {
      status: "delivered",
      delivered_at: new Date().toISOString(),
    });

    await addLog({
      project_slug: slug,
      agent_name: "Pipeline",
      message: "Pipeline complete. Project delivered.",
    });
  } catch (err: unknown) {
    const error = err as Error;
    await updateProject(slug, { status: "blocked", health: "red", error: error.message });
    await addLog({
      project_slug: slug,
      agent_name: "Pipeline",
      level: "error",
      message: `Pipeline error: ${error.message}`,
    });
  } finally {
    activePipelines.delete(slug);
  }
}
