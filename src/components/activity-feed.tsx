import type { LogEntry } from "@/lib/db";

const agentColors: Record<string, string> = {
  Atlas: "bg-yellow-500/20 text-yellow-400",
  Meridian: "bg-blue-500/20 text-blue-400",
  Forge: "bg-orange-500/20 text-orange-400",
  Palette: "bg-pink-500/20 text-pink-400",
  "Coder-1": "bg-indigo-500/20 text-indigo-400",
  "Coder-2": "bg-violet-500/20 text-violet-400",
  Sentinel: "bg-red-500/20 text-red-400",
  Conduit: "bg-emerald-500/20 text-emerald-400",
  Pipeline: "bg-zinc-500/20 text-zinc-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ActivityFeed({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Recent Activity</h2>
        <p className="text-sm text-zinc-600">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Recent Activity</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-sm">
            <span className="text-zinc-600 text-xs w-8 shrink-0 pt-0.5">{timeAgo(log.created_at)}</span>
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${agentColors[log.agent_name || ""] || "bg-zinc-700 text-zinc-300"}`}
            >
              {log.agent_name || "system"}
            </span>
            <span className="text-zinc-300 text-xs">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
