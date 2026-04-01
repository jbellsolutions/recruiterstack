"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PlanPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [readyToBuild, setReadyToBuild] = useState(false);
  const [provider, setProvider] = useState("anthropic");
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Seed from ideas page if an idea was selected
  useEffect(() => {
    const idea = searchParams.get("idea");
    const brief = searchParams.get("brief");
    if (idea && brief) {
      setProjectName(idea);
      setProjectBrief(brief);
      setMessages([
        {
          role: "assistant",
          content: `Great choice! **${idea}** is a solid project.\n\nHere's the starting brief I have:\n\n> ${brief}\n\nBefore we build this, let me ask a few questions to make it perfect for your needs:\n\n1. **Who will use this?** (Your team only, brokers, members/employees, or the public?)\n2. **Any must-have features** beyond what's described?\n3. **Do you have branding preferences?** (Colors, logo, company name to use?)\n\nJust answer what you can — we can always refine later.`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm here to help you figure out what to build.\n\nTell me about a problem you're trying to solve, or something you wish you had at work. I'll help you turn it into a project the team can build.\n\nFor example:\n- "I need a way for our members to check their coverage"\n- "We waste hours creating board decks every quarter"\n- "Our brokers keep asking for the same reports"\n\nWhat's on your mind?`,
        },
      ]);
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/plan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          projectName,
          projectBrief,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.projectName) setProjectName(data.projectName);
      if (data.projectBrief) setProjectBrief(data.projectBrief);
      if (data.readyToBuild) setReadyToBuild(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again?" },
      ]);
    }
    setLoading(false);
  }

  async function handleStartBuilding() {
    if (!projectName.trim() || !projectBrief.trim()) return;
    setStarting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          brief: projectBrief.trim(),
          provider,
        }),
      });
      const data = await res.json();
      router.push(`/projects/${data.slug}`);
    } catch {
      setStarting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Plan a Project</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Describe what you need. I&apos;ll help you shape it into a project brief, then the team builds it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600/20 text-blue-200"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j} className="text-white font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="px-4 py-3 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you want to build..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Project Summary Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Project Summary</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Benefits Eligibility Checker"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Brief</label>
                <textarea
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="What the team will build..."
                  rows={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">AI Provider</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider("anthropic")}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                      provider === "anthropic"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500"
                    }`}
                  >
                    Anthropic
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider("openrouter")}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                      provider === "openrouter"
                        ? "bg-purple-600/20 border-purple-500 text-purple-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500"
                    }`}
                  >
                    OpenRouter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Build Button */}
          <button
            onClick={handleStartBuilding}
            disabled={!projectName.trim() || !projectBrief.trim() || starting}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              projectName.trim() && projectBrief.trim()
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {starting ? "Starting..." : "Start Building"}
          </button>

          {readyToBuild && projectName && (
            <div className="bg-green-950/50 border border-green-800 rounded-lg p-3">
              <p className="text-xs text-green-400">
                Your project brief looks good! Hit &quot;Start Building&quot; whenever you&apos;re ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-8 text-zinc-500">Loading...</div>}>
      <PlanPageInner />
    </Suspense>
  );
}
