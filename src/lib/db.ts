import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// During build, Turso/LibSQL might not be available. Use a fallback.
let db: ReturnType<typeof createClient>;

function getDb() {
  if (!db) {
    try {
      const localDbPath = path.join(process.cwd(), "data", "local.db");
      fs.mkdirSync(path.dirname(localDbPath), { recursive: true });
      db = createClient({
        url: process.env.TURSO_DATABASE_URL || `file:${localDbPath}`,
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

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? []);
}

function parseStringArray(value: unknown): string[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function parseTranscript(
  value: unknown
): Array<{ role: string; content: string }> {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is { role: string; content: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof item.role === "string" &&
          typeof item.content === "string"
      )
      .map((item) => ({ role: item.role, content: item.content }));
  } catch {
    return [];
  }
}

function toBoolean(value: unknown): boolean {
  return Number(value) === 1;
}

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
    `CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      agency_type TEXT,
      ats TEXT,
      selected_problems TEXT DEFAULT '[]',
      priority_order TEXT DEFAULT '[]',
      custom_problems TEXT DEFAULT '[]',
      generated_plan_summary TEXT,
      project_name TEXT,
      project_brief TEXT,
      transcript_json TEXT DEFAULT '[]',
      transcript_summary TEXT,
      source_repo TEXT DEFAULT 'recruiterstack',
      source_path TEXT DEFAULT '/plan',
      engagement_mode TEXT,
      audit_interest INTEGER DEFAULT 0,
      send_plan_consent INTEGER DEFAULT 0,
      newsletter_consent INTEGER DEFAULT 0,
      follow_up_consent INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      sync_error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS prospect_sync_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prospect_id INTEGER NOT NULL,
      destination TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT,
      response TEXT,
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

// --- Prospects ---

export interface Prospect {
  id: number;
  name: string;
  email: string;
  agency_type: string | null;
  ats: string | null;
  selected_problems: string[];
  priority_order: string[];
  custom_problems: string[];
  generated_plan_summary: string | null;
  project_name: string | null;
  project_brief: string | null;
  transcript_json: Array<{ role: string; content: string }>;
  transcript_summary: string | null;
  source_repo: string | null;
  source_path: string | null;
  engagement_mode: string | null;
  audit_interest: boolean;
  send_plan_consent: boolean;
  newsletter_consent: boolean;
  follow_up_consent: boolean;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProspectInput {
  name: string;
  email: string;
  agency_type?: string | null;
  ats?: string | null;
  selected_problems?: string[];
  priority_order?: string[];
  custom_problems?: string[];
  generated_plan_summary?: string | null;
  project_name?: string | null;
  project_brief?: string | null;
  transcript_json?: Array<{ role: string; content: string }>;
  transcript_summary?: string | null;
  source_repo?: string | null;
  source_path?: string | null;
  engagement_mode?: string | null;
  audit_interest?: boolean;
  send_plan_consent?: boolean;
  newsletter_consent?: boolean;
  follow_up_consent?: boolean;
}

function mapProspectRow(row: Record<string, unknown>): Prospect {
  return {
    id: Number(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    agency_type: (row.agency_type as string | null) || null,
    ats: (row.ats as string | null) || null,
    selected_problems: parseStringArray(row.selected_problems),
    priority_order: parseStringArray(row.priority_order),
    custom_problems: parseStringArray(row.custom_problems),
    generated_plan_summary: (row.generated_plan_summary as string | null) || null,
    project_name: (row.project_name as string | null) || null,
    project_brief: (row.project_brief as string | null) || null,
    transcript_json: parseTranscript(row.transcript_json),
    transcript_summary: (row.transcript_summary as string | null) || null,
    source_repo: (row.source_repo as string | null) || null,
    source_path: (row.source_path as string | null) || null,
    engagement_mode: (row.engagement_mode as string | null) || null,
    audit_interest: toBoolean(row.audit_interest),
    send_plan_consent: toBoolean(row.send_plan_consent),
    newsletter_consent: toBoolean(row.newsletter_consent),
    follow_up_consent: toBoolean(row.follow_up_consent),
    sync_status: String(row.sync_status || "pending"),
    sync_error: (row.sync_error as string | null) || null,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || ""),
  };
}

export async function createProspect(
  data: CreateProspectInput
): Promise<number> {
  await ensureTables();
  const result = await getDb().execute({
    sql: `INSERT INTO prospects (
      name,
      email,
      agency_type,
      ats,
      selected_problems,
      priority_order,
      custom_problems,
      generated_plan_summary,
      project_name,
      project_brief,
      transcript_json,
      transcript_summary,
      source_repo,
      source_path,
      engagement_mode,
      audit_interest,
      send_plan_consent,
      newsletter_consent,
      follow_up_consent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.name,
      data.email,
      data.agency_type || null,
      data.ats || null,
      stringifyJson(data.selected_problems || []),
      stringifyJson(data.priority_order || []),
      stringifyJson(data.custom_problems || []),
      data.generated_plan_summary || null,
      data.project_name || null,
      data.project_brief || null,
      stringifyJson(data.transcript_json || []),
      data.transcript_summary || null,
      data.source_repo || "recruiterstack",
      data.source_path || "/plan",
      data.engagement_mode || null,
      data.audit_interest ? 1 : 0,
      data.send_plan_consent ? 1 : 0,
      data.newsletter_consent ? 1 : 0,
      data.follow_up_consent ? 1 : 0,
    ],
  });
  return Number(result.lastInsertRowid);
}

export async function getProspectById(id: number): Promise<Prospect | null> {
  await ensureTables();
  const result = await getDb().execute({
    sql: "SELECT * FROM prospects WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapProspectRow(row) : null;
}

export async function updateProspectSyncStatus(
  id: number,
  data: { sync_status: string; sync_error?: string | null }
): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: `UPDATE prospects
      SET sync_status = ?, sync_error = ?, updated_at = datetime('now')
      WHERE id = ?`,
    args: [data.sync_status, data.sync_error || null, id],
  });
}

export async function addProspectSyncEvent(data: {
  prospect_id: number;
  destination: string;
  status: string;
  payload?: string;
  response?: string;
}): Promise<void> {
  await ensureTables();
  await getDb().execute({
    sql: `INSERT INTO prospect_sync_events (
      prospect_id,
      destination,
      status,
      payload,
      response
    ) VALUES (?, ?, ?, ?, ?)`,
    args: [
      data.prospect_id,
      data.destination,
      data.status,
      data.payload || null,
      data.response || null,
    ],
  });
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
