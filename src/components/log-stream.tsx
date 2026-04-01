"use client";

import { useEffect, useState, useRef } from "react";

interface LogEntry {
  id: number;
  agent_name: string;
  phase: string;
  level: string;
  message: string;
  created_at: string;
}

const agentColors: Record<string, string> = {
  Pipeline: "text-zinc-400",
  Atlas: "text-yellow-400",
  Meridian: "text-blue-400",
  Forge: "text-orange-400",
  Palette: "text-pink-400",
  "Coder-1": "text-indigo-400",
  "Coder-2": "text-violet-400",
  Sentinel: "text-red-400",
  Conduit: "text-emerald-400",
};

const levelColors: Record<string, string> = {
  info: "text-zinc-300",
  warn: "text-yellow-300",
  error: "text-red-300",
};

export function LogStream({ slug }: { slug: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use polling instead of SSE for wider compatibility
    let active = true;
    let lastId = 0;

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/projects/${slug}`);
        const data = await res.json();
        if (data.logs) {
          const newLogs = (data.logs as LogEntry[]).filter((l) => l.id > lastId);
          if (newLogs.length > 0) {
            setLogs((prev) => [...prev, ...newLogs.reverse()]);
            lastId = Math.max(...newLogs.map((l) => l.id));
          }
        }
        setConnected(true);
      } catch {
        setConnected(false);
      }
      if (active) setTimeout(poll, 3000);
    }

    poll();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Build Log</h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
          <span className="text-xs text-zinc-500">{connected ? "Live" : "Connecting..."}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <p className="text-zinc-600 py-4 text-center">Waiting for build to start...</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-zinc-600 w-14 shrink-0">
              {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className={`w-16 shrink-0 ${agentColors[log.agent_name || ""] || "text-zinc-400"}`}>
              {log.agent_name || "system"}
            </span>
            <span className={levelColors[log.level] || "text-zinc-300"}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
