"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProjectForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [slug, setSlug] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !brief.trim()) return;
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        brief: brief.trim(),
        provider,
      }),
    });
    const data = await res.json();
    setSlug(data.slug);
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      router.push(`/projects/${data.slug}`);
    }, 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        + New Project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">New Project</h2>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My SaaS App"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
            required
            disabled={submitted}
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Brief — describe what you want to build</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="A recruiting system for insurance agents. Facebook ads → lead form → AI call in 2 min → voicemail if no answer → interview booked on calendar..."
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none resize-none"
            required
            disabled={submitted}
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">AI Provider</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setProvider("anthropic")}
              disabled={submitted}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                provider === "anthropic"
                  ? "bg-blue-600/20 border-blue-500 text-blue-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              Anthropic (Claude)
              <span className="block text-xs text-zinc-500 mt-0.5">Best quality</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider("openrouter")}
              disabled={submitted}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                provider === "openrouter"
                  ? "bg-purple-600/20 border-purple-500 text-purple-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              OpenRouter
              <span className="block text-xs text-zinc-500 mt-0.5">More models, lower cost</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { setOpen(false); setSubmitted(false); }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !brief.trim() || submitted}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? "Starting..." : submitted ? "Building!" : "Start Building"}
          </button>
        </div>

        {submitted && (
          <div className="bg-green-950 border border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-400 font-medium">Project started! The team is working on it now.</p>
            <p className="text-xs text-green-500/70 mt-1">Redirecting to project page...</p>
          </div>
        )}
      </form>
    </div>
  );
}
