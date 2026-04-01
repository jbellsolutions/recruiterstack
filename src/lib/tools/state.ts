import { updateProject, addLog, addMessage, saveArtifact, getArtifact } from "@/lib/db";

export async function handleState(
  tool: string,
  input: Record<string, unknown>,
  context: { projectSlug: string; agentName: string }
): Promise<string> {
  switch (tool) {
    case "update_status": {
      const updates: Record<string, unknown> = {};
      if (input.current_phase) updates.current_phase = input.current_phase;
      if (input.phase_number) updates.phase_number = input.phase_number;
      if (input.status) updates.status = input.status;
      if (input.health) updates.health = input.health;
      if (input.github_url) updates.github_url = input.github_url;
      if (input.production_url) updates.production_url = input.production_url;
      if (input.error) updates.error = input.error;
      await updateProject(context.projectSlug, updates);
      return `Project status updated: ${JSON.stringify(updates)}`;
    }

    case "post_log": {
      await addLog({
        project_slug: context.projectSlug,
        agent_name: context.agentName,
        level: (input.level as string) || "info",
        message: input.message as string,
      });
      return `Log posted: ${input.message}`;
    }

    case "ask_user": {
      await addMessage({
        project_slug: context.projectSlug,
        sender: context.agentName,
        role: "agent",
        content: input.question as string,
        needs_response: true,
      });
      return `Question posted to dashboard. The user will see this and can respond via the project chat. For now, continue with your best judgment or note that you're waiting for input.`;
    }

    case "save_artifact": {
      await saveArtifact({
        project_slug: context.projectSlug,
        artifact_type: input.type as string,
        content: input.content as string,
        created_by: context.agentName,
      });
      return `Artifact '${input.type}' saved.`;
    }

    case "get_artifact": {
      const content = await getArtifact(context.projectSlug, input.type as string);
      if (!content) return `No artifact of type '${input.type}' found for this project.`;
      return content;
    }

    case "complete_phase": {
      await addLog({
        project_slug: context.projectSlug,
        agent_name: context.agentName,
        level: "info",
        message: `Phase complete: ${input.summary}`,
      });
      // The pipeline engine reads this signal — don't update phase here,
      // let the pipeline handle the transition
      return `PHASE_COMPLETE: ${input.summary}`;
    }

    default:
      return `Error: Unknown state tool: ${tool}`;
  }
}
