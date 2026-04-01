import fs from "fs";
import path from "path";

const BASE_DIR = process.env.WORKSPACE_BASE || "/tmp/recruiterstack";

export function getWorkspacePath(slug: string): string {
  return path.join(BASE_DIR, slug);
}

export function ensureWorkspace(slug: string): string {
  const dir = getWorkspacePath(slug);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function workspaceExists(slug: string): boolean {
  return fs.existsSync(getWorkspacePath(slug));
}

export function cleanWorkspace(slug: string): void {
  const dir = getWorkspacePath(slug);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
