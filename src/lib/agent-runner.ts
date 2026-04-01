import type Anthropic from "@anthropic-ai/sdk";
import { createAIClient, getModel } from "./ai-client";
import { TOOL_DEFINITIONS, executeTool } from "./tools";
import { startAgentRun, completeAgentRun, addLog } from "./db";

const MAX_ITERATIONS = 60;

interface AgentRunConfig {
  projectSlug: string;
  agentName: string;
  playbook: string;
  teamCharter: string;
  projectState: string; // JSON string of current project + artifacts
  phase: string;
  provider: "anthropic" | "openrouter";
  model?: string;
  workspacePath: string;
  signal?: AbortSignal;
}

interface AgentRunResult {
  completed: boolean;
  summary: string;
  inputTokens: number;
  outputTokens: number;
  error?: string;
}

export async function runAgent(config: AgentRunConfig): Promise<AgentRunResult> {
  const client = createAIClient({ provider: config.provider, model: config.model });
  const model = getModel({ provider: config.provider, model: config.model });

  const runId = await startAgentRun({
    project_slug: config.projectSlug,
    agent_name: config.agentName,
    phase: config.phase,
  });

  await addLog({
    project_slug: config.projectSlug,
    agent_name: config.agentName,
    phase: config.phase,
    message: `Starting ${config.agentName} for phase: ${config.phase}`,
  });

  const systemPrompt = [
    "# Team Charter\n\n" + config.teamCharter,
    "\n\n# Your Playbook\n\n" + config.playbook,
    "\n\n# Current Project State\n\n" + config.projectState,
    "\n\n# Important Rules",
    "- Use the tools provided to do your work. Do NOT just describe what you would do — actually do it.",
    "- Write files, run commands, and update status using the tools.",
    "- When your work for this phase is complete and verified, call the complete_phase tool.",
    "- The project workspace is at: " + config.workspacePath,
    "- All file paths are relative to the workspace root.",
    "- If you need user input, use the ask_user tool.",
    "- Post logs frequently so the dashboard shows real-time progress.",
  ].join("\n");

  const userMessage = `You are ${config.agentName}. Execute your run checklist for project '${config.projectSlug}' which is in phase '${config.phase}'. Do your work now using the tools. When done, call complete_phase.`;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let phaseCompleted = false;
  let completionSummary = "";

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      if (config.signal?.aborted) {
        throw new Error("Pipeline cancelled");
      }

      const response = await client.messages.create({
        model,
        max_tokens: 8192,
        system: systemPrompt,
        tools: TOOL_DEFINITIONS,
        messages,
      });

      totalInputTokens += response.usage?.input_tokens || 0;
      totalOutputTokens += response.usage?.output_tokens || 0;

      // Process response content blocks
      const assistantContent = response.content;
      messages.push({ role: "assistant", content: assistantContent });

      // Check if there are tool calls
      const toolUseBlocks = assistantContent.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      // Log any text output
      for (const block of assistantContent) {
        if (block.type === "text" && block.text.trim()) {
          // Log first 200 chars of agent reasoning
          const preview = block.text.slice(0, 200) + (block.text.length > 200 ? "..." : "");
          await addLog({
            project_slug: config.projectSlug,
            agent_name: config.agentName,
            phase: config.phase,
            message: preview,
          });
        }
      }

      // If no tool calls, agent is done talking
      if (toolUseBlocks.length === 0) {
        if (response.stop_reason === "end_turn") {
          completionSummary = "Agent finished without calling complete_phase";
          break;
        }
        continue;
      }

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolBlock of toolUseBlocks) {
        const input = toolBlock.input as Record<string, unknown>;

        // Log tool call
        await addLog({
          project_slug: config.projectSlug,
          agent_name: config.agentName,
          phase: config.phase,
          message: `Tool: ${toolBlock.name}${toolBlock.name === "post_log" ? "" : " → " + JSON.stringify(input).slice(0, 150)}`,
        });

        const result = await executeTool(toolBlock.name, input, {
          projectSlug: config.projectSlug,
          workspacePath: config.workspacePath,
          agentName: config.agentName,
        });

        // Check for phase completion signal
        if (result.startsWith("PHASE_COMPLETE:")) {
          phaseCompleted = true;
          completionSummary = result.replace("PHASE_COMPLETE: ", "");
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolBlock.id,
          content: result.slice(0, 10000), // Truncate very long results
        });
      }

      messages.push({ role: "user", content: toolResults });

      if (phaseCompleted) break;
    }

    await completeAgentRun(runId, {
      status: phaseCompleted ? "completed" : "stopped",
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
    });

    await addLog({
      project_slug: config.projectSlug,
      agent_name: config.agentName,
      phase: config.phase,
      message: phaseCompleted
        ? `Completed: ${completionSummary}`
        : `Stopped after ${MAX_ITERATIONS} iterations without completing`,
    });

    return {
      completed: phaseCompleted,
      summary: completionSummary,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
    };
  } catch (err: unknown) {
    const error = err as Error;
    await completeAgentRun(runId, {
      status: "error",
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      error: error.message,
    });

    await addLog({
      project_slug: config.projectSlug,
      agent_name: config.agentName,
      phase: config.phase,
      level: "error",
      message: `Error: ${error.message}`,
    });

    return {
      completed: false,
      summary: "",
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      error: error.message,
    };
  }
}
