import type Anthropic from "@anthropic-ai/sdk";
import { handleFileOps } from "./file-ops";
import { handleShell } from "./shell";
import { handleState } from "./state";

// Tool definitions for Anthropic tool_use API
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file in the project workspace. Returns the file content as a string.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Relative path from project root (e.g., 'src/app/page.tsx')" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file in the project workspace. Creates the file and any parent directories if they don't exist. Overwrites existing files.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Relative path from project root" },
        content: { type: "string", description: "Full file content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_files",
    description: "List files and directories at a path in the project workspace. Returns a newline-separated list.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Relative path from project root. Use '.' for root." },
        recursive: { type: "boolean", description: "If true, list recursively. Default false." },
      },
      required: ["path"],
    },
  },
  {
    name: "run_command",
    description: "Execute a shell command in the project workspace directory. Returns stdout and stderr. Use for npm install, npm test, npm build, git commands, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string", description: "Shell command to execute (e.g., 'npm test', 'git add .')" },
      },
      required: ["command"],
    },
  },
  {
    name: "update_status",
    description: "Update the project's status, phase, or health in the dashboard database. Use this to track progress.",
    input_schema: {
      type: "object" as const,
      properties: {
        current_phase: { type: "string", description: "Current phase name" },
        phase_number: { type: "number", description: "Phase number (1-7)" },
        status: { type: "string", description: "Project status: active, blocked, delivered" },
        health: { type: "string", description: "Health: green, yellow, red" },
        github_url: { type: "string", description: "GitHub repo URL when created" },
        production_url: { type: "string", description: "Production URL when deployed" },
        error: { type: "string", description: "Error message if blocked" },
      },
      required: [],
    },
  },
  {
    name: "post_log",
    description: "Post a log message visible on the dashboard. Use this to communicate progress, decisions, and status updates.",
    input_schema: {
      type: "object" as const,
      properties: {
        message: { type: "string", description: "Log message to display on the dashboard" },
        level: { type: "string", description: "Log level: info, warn, error. Default info." },
      },
      required: ["message"],
    },
  },
  {
    name: "ask_user",
    description: "Ask the user a question via the dashboard chat. The pipeline will pause until they respond. Use when you need clarification or a decision.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string", description: "The question to ask the user" },
      },
      required: ["question"],
    },
  },
  {
    name: "save_artifact",
    description: "Save a project artifact (spec, architecture, design, etc.) to the database. Used for passing structured data between agents.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", description: "Artifact type: spec, architecture, design, implementation, qa_report, final_report" },
        content: { type: "string", description: "Artifact content as JSON string" },
      },
      required: ["type", "content"],
    },
  },
  {
    name: "get_artifact",
    description: "Retrieve a previously saved artifact for this project.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", description: "Artifact type to retrieve" },
      },
      required: ["type"],
    },
  },
  {
    name: "complete_phase",
    description: "Signal that the current phase is complete and the pipeline should advance. Call this ONLY when your work is fully done and verified.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: { type: "string", description: "Brief summary of what was accomplished" },
      },
      required: ["summary"],
    },
  },
];

// Execute a tool call and return the result
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  context: { projectSlug: string; workspacePath: string; agentName: string }
): Promise<string> {
  switch (toolName) {
    case "read_file":
    case "write_file":
    case "list_files":
      return handleFileOps(toolName, input, context.workspacePath);

    case "run_command":
      return handleShell(input.command as string, context.workspacePath);

    case "update_status":
    case "post_log":
    case "ask_user":
    case "save_artifact":
    case "get_artifact":
    case "complete_phase":
      return handleState(toolName, input, context);

    default:
      return `Error: Unknown tool '${toolName}'`;
  }
}
