import { createClient } from "@libsql/client";

// During build, Turso/LibSQL might not be available. Use a fallback.
let db: ReturnType<typeof createClient>;

function getDb() {
  if (!db) {
    try {
      db = createClient({
        url: process.env.TURSO_DATABASE_URL || "file:data/local.db",
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    } catch {
      // Build-time fallback — create in-memory
      db = createClient({ url: ":memory:" });
    }
  }
  return db;
}

// Initialize tables on first import
let initialized = false;
async function ensureTables() {
  if (initialized) return;
  await getDb().batch([
    `CREATE TABLE IF NOT EXISTS projects (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brief TEXT,
      status TEXT DEFAULT 'active',
      current_phase TEXT DEFAULT 'intake',
      phase_number INTEGER DEFAULT 0,
      health TEXT DEFAULT 'green',
      provider TEXT DEFAULT 'anthropic',
      model TEXT DEFAULT 'claude-sonnet-4-20250514',
      github_url TEXT,
      production_url TEXT,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      delivered_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS agent_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_slug TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      phase TEXT,
      status TEXT DEFAULT 'running',
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      error TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_slug TEXT NOT NULL,
      agent_name TEXT,
      phase TEXT,
      level TEXT DEFAULT 'info',
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_slug TEXT NOT NULL,
      sender TEXT NOT NULL,
      role TEXT DEFAULT 'agent',
      content TEXT NOT NULL,
      needs_response INTEGER DEFAULT 0,
      responded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_slug TEXT NOT NULL,
      artifact_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ]);
  initialized = true;
}

// --- Projects ---

export interface Project {
  slug: string;
  name: string;
  brief: string | null;
  status: string;
  current_phase: string;
  phase_number: number;
  health: string;
  provider: string;
  model: string;
  github_url: string | null;
  production_url: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
}

export async function getProjects(): Promise<Project[]> {
  await ensureTables();
  const result = await getDb().execute("SELECT * FROM projects ORDER BY updated_at DESC");
  return result.rows as unknown as Project[];
}

export async function getProject(slug: string): Promise<Project | null> {
  await ensureTables();
  const result = await getDb().execute({ sql: "SELECT * FROM projects WHERE slug = ?", args: [slug] });
  return (result.rows[0] as unknown as Project) || null;
}

export async function createProject(data: {
  slug: string;
  name: string;
  brief?: string;
  provider?: string;
  model?: string;
}): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: `INSERT INTO projects (slug, name, brief, provider, model) VALUES (?, ?, ?, ?, ?)`,
    args: [data.slug, data.name, data.brief || null, data.provider || "anthropic", data.model || "claude-sonnet-4-20250514"],
  });
}

export async function updateProject(slug: string, updates: Partial<Project>): Promise<void> {
  await ensureTables();
  const fields = Object.entries(updates)
    .filter(([k]) => k !== "slug")
    .map(([k]) => `${k} = ?`);
  const values = Object.entries(updates)
    .filter(([k]) => k !== "slug")
    .map(([, v]) => v);
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  await getDb().execute({
    sql: `UPDATE projects SET ${fields.join(", ")} WHERE slug = ?`,
    args: [...values, slug],
  });
}

// --- Logs ---

export interface LogEntry {
  id: number;
  project_slug: string;
  agent_name: string;
  phase: string;
  level: string;
  message: string;
  created_at: string;
}

export async function addLog(entry: { project_slug: string; agent_name?: string; phase?: string; level?: string; message: string }): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: "INSERT INTO logs (project_slug, agent_name, phase, level, message) VALUES (?, ?, ?, ?, ?)",
    args: [entry.project_slug, entry.agent_name || null, entry.phase || null, entry.level || "info", entry.message],
  });
}

export async function getProjectLogs(slug: string, limit = 100): Promise<LogEntry[]> {
  await ensureTables();
  const result = await getDb().execute({
    sql: "SELECT * FROM logs WHERE project_slug = ? ORDER BY created_at DESC LIMIT ?",
    args: [slug, limit],
  });
  return result.rows as unknown as LogEntry[];
}

// --- Messages ---

export interface Message {
  id: number;
  project_slug: string;
  sender: string;
  role: string;
  content: string;
  needs_response: number;
  responded: number;
  created_at: string;
}

export async function addMessage(entry: { project_slug: string; sender: string; role?: string; content: string; needs_response?: boolean }): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: "INSERT INTO messages (project_slug, sender, role, content, needs_response) VALUES (?, ?, ?, ?, ?)",
    args: [entry.project_slug, entry.sender, entry.role || "agent", entry.content, entry.needs_response ? 1 : 0],
  });
}

export async function getProjectMessages(slug: string, limit = 100): Promise<Message[]> {
  await ensureTables();
  const result = await getDb().execute({
    sql: "SELECT * FROM messages WHERE project_slug = ? ORDER BY created_at DESC LIMIT ?",
    args: [slug, limit],
  });
  return result.rows as unknown as Message[];
}

export async function respondToMessage(messageId: number, response: string): Promise<void> {
  await ensureTables();
  const msg = await getDb().execute({ sql: "SELECT * FROM messages WHERE id = ?", args: [messageId] });
  const row = msg.rows[0] as unknown as Message;
  if (!row) return;
  await getDb().execute({ sql: "UPDATE messages SET responded = 1 WHERE id = ?", args: [messageId] });
  await addMessage({ project_slug: row.project_slug, sender: "user", role: "user", content: response });
}

export async function getPendingQuestions(slug?: string): Promise<Message[]> {
  await ensureTables();
  const sql = slug
    ? "SELECT * FROM messages WHERE role = 'agent' AND needs_response = 1 AND responded = 0 AND project_slug = ?"
    : "SELECT * FROM messages WHERE role = 'agent' AND needs_response = 1 AND responded = 0";
  const result = await getDb().execute({ sql, args: slug ? [slug] : [] });
  return result.rows as unknown as Message[];
}

// --- Agent Runs ---

export async function startAgentRun(data: { project_slug: string; agent_name: string; phase: string }): Promise<number> {
  await ensureTables();
  const result = await getDb().execute({
    sql: "INSERT INTO agent_runs (project_slug, agent_name, phase) VALUES (?, ?, ?)",
    args: [data.project_slug, data.agent_name, data.phase],
  });
  return Number(result.lastInsertRowid);
}

export async function completeAgentRun(id: number, data: { status: string; input_tokens?: number; output_tokens?: number; error?: string }): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: "UPDATE agent_runs SET status = ?, input_tokens = ?, output_tokens = ?, completed_at = datetime('now'), error = ? WHERE id = ?",
    args: [data.status, data.input_tokens || 0, data.output_tokens || 0, data.error || null, id],
  });
}

// --- Artifacts ---

export async function saveArtifact(data: { project_slug: string; artifact_type: string; content: string; created_by?: string }): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: "INSERT INTO artifacts (project_slug, artifact_type, content, created_by) VALUES (?, ?, ?, ?)",
    args: [data.project_slug, data.artifact_type, data.content, data.created_by || null],
  });
}

export async function getArtifact(slug: string, type: string): Promise<string | null> {
  await ensureTables();
  const result = await getDb().execute({
    sql: "SELECT content FROM artifacts WHERE project_slug = ? AND artifact_type = ? ORDER BY created_at DESC LIMIT 1",
    args: [slug, type],
  });
  return (result.rows[0]?.content as string) || null;
}

// --- Team Status (computed) ---

export interface TeamMember {
  codename: string;
  role: string;
  current_project: string | null;
  status: string;
}

const TEAM: Array<{ codename: string; role: string }> = [
  { codename: "Atlas", role: "CEO / Orchestrator" },
  { codename: "Meridian", role: "Project Manager" },
  { codename: "Forge", role: "Lead Architect" },
  { codename: "Palette", role: "Lead Designer" },
  { codename: "Coder-1", role: "Senior Developer" },
  { codename: "Coder-2", role: "Senior Developer" },
  { codename: "Sentinel", role: "QA Lead" },
  { codename: "Conduit", role: "DevOps Engineer" },
];

export async function getTeamStatus(): Promise<TeamMember[]> {
  await ensureTables();
  const running = await getDb().execute(
    "SELECT agent_name, project_slug FROM agent_runs WHERE status = 'running' ORDER BY started_at DESC"
  );
  const activeMap = new Map<string, string>();
  for (const row of running.rows) {
    const name = row.agent_name as string;
    if (!activeMap.has(name)) activeMap.set(name, row.project_slug as string);
  }
  return TEAM.map((t) => ({
    ...t,
    current_project: activeMap.get(t.codename) || null,
    status: activeMap.has(t.codename) ? "active" : "idle",
  }));
}
