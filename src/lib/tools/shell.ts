import { execSync } from "child_process";

const MAX_OUTPUT_LENGTH = 20000;
const TIMEOUT_MS = 120000; // 2 minutes

// Blocked commands that could escape the workspace or damage the system
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//,
  /sudo\s/,
  /chmod\s.*777/,
  /curl.*\|.*sh/,
  /wget.*\|.*sh/,
];

export function handleShell(command: string, workspacePath: string): string {
  // Safety check
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return `Error: Blocked command for safety: ${command}`;
    }
  }

  try {
    const output = execSync(command, {
      cwd: workspacePath,
      timeout: TIMEOUT_MS,
      maxBuffer: 1024 * 1024 * 10, // 10MB
      encoding: "utf-8",
      env: {
        ...process.env,
        HOME: workspacePath,
        NODE_ENV: "development",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const result = output || "(no output)";
    if (result.length > MAX_OUTPUT_LENGTH) {
      return result.slice(0, MAX_OUTPUT_LENGTH) + `\n\n[... truncated, ${result.length} chars total]`;
    }
    return result;
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number; message?: string };
    const stdout = e.stdout || "";
    const stderr = e.stderr || "";
    const combined = `Exit code: ${e.status || "unknown"}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    if (combined.length > MAX_OUTPUT_LENGTH) {
      return combined.slice(0, MAX_OUTPUT_LENGTH) + "\n[... truncated]";
    }
    return combined;
  }
}
