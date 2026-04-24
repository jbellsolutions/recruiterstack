"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/lib/db";

const senderColors: Record<string, string> = {
  Atlas: "bg-yellow-500/20 text-yellow-400",
  Meridian: "bg-blue-500/20 text-blue-400",
  Forge: "bg-orange-500/20 text-orange-400",
  Palette: "bg-pink-500/20 text-pink-400",
  "Coder-1": "bg-indigo-500/20 text-indigo-400",
  "Coder-2": "bg-violet-500/20 text-violet-400",
  Sentinel: "bg-red-500/20 text-red-400",
  Conduit: "bg-emerald-500/20 text-emerald-400",
  user: "bg-blue-600/30 text-blue-300",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ProjectChat({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function fetchMessages() {
      const res = await fetch(`/api/projects/${slug}/messages`);
      const data = await res.json();
      if (active) {
        setMessages(data.messages || []);
      }
    }

    void fetchMessages();
    const id = setInterval(() => {
      void fetchMessages();
    }, 5000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    if (replyTo) {
      await fetch(`/api/projects/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: replyTo, response: input.trim() }),
      });
      setReplyTo(null);
    } else {
      await fetch(`/api/projects/${slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_slug: slug,
          sender: "user",
          role: "user",
          content: input.trim(),
          needs_response: false,
        }),
      });
    }

    setInput("");
    setSending(false);
    const res = await fetch(`/api/projects/${slug}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  // Reverse to show oldest first (messages come newest-first from API)
  const sorted = [...messages].reverse();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Project Chat</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Agents ask questions here. You respond.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">
            No messages yet. Agents will ask questions here as they work.
          </p>
        )}
        {sorted.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-1.5 py-0.5 rounded ${senderColors[msg.sender] || "bg-zinc-700 text-zinc-300"}`}
              >
                {msg.sender}
              </span>
              <span className="text-[10px] text-zinc-600">{timeAgo(msg.created_at)}</span>
              {msg.role === "agent" && msg.needs_response && !msg.responded && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded animate-pulse">
                  Needs answer
                </span>
              )}
            </div>
            <div
              className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                msg.role === "user"
                  ? "bg-blue-600/20 text-blue-200"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "agent" && msg.needs_response && !msg.responded && (
              <button
                onClick={() => {
                  setReplyTo(msg.id);
                  document.getElementById("chat-input")?.focus();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 mt-1"
              >
                Reply to this
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-zinc-800">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className="text-amber-400">Replying to question #{replyTo}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={replyTo ? "Type your answer..." : "Send a message to the team..."}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
