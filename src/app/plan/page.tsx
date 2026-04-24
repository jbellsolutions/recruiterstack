"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AGENCY_TYPES,
  AUDIT_URL,
  PROBLEM_CATEGORIES,
} from "@/lib/funnel-data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FunnelState {
  agencyType: string | null;
  ats: string | null;
  selectedProblems: string[];
  priorityOrder: string[];
  customProblems: string[];
  planSummary: string | null;
  journeyStage: string;
  helpMode: string;
  auditInterest: boolean;
  leadCaptureReady: boolean;
}

const EMPTY_FUNNEL_STATE: FunnelState = {
  agencyType: null,
  ats: null,
  selectedProblems: [],
  priorityOrder: [],
  customProblems: [],
  planSummary: null,
  journeyStage: "welcome",
  helpMode: "undecided",
  auditInterest: false,
  leadCaptureReady: false,
};

function renderMessage(content: string) {
  return content.split(/(\*\*.*?\*\*)/).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`} className="text-white font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function FunnelPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [readyToBuild, setReadyToBuild] = useState(false);
  const [provider, setProvider] = useState("anthropic");
  const [starting, setStarting] = useState(false);
  const [funnelState, setFunnelState] = useState<FunnelState>(EMPTY_FUNNEL_STATE);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [sendPlanConsent, setSendPlanConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [followUpConsent, setFollowUpConsent] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [leadStatus, setLeadStatus] = useState<{
    tone: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const idea = searchParams.get("idea");
    const brief = searchParams.get("brief");

    if (idea && brief) {
      setProjectName(idea);
      setProjectBrief(brief);
      setFunnelState((prev) => ({
        ...prev,
        selectedProblems: [idea],
        priorityOrder: [idea],
        journeyStage: "discovery",
      }));
      setMessages([
        {
          role: "assistant",
          content:
            `Welcome to the rabbit hole. I pulled in **${idea}** as your starting point.\n\n` +
            `I already have a draft brief for it, so let’s make this specific to your world.\n\n` +
            `**First question:** what kind of staffing agency are you, and what ATS or workflow stack are you using today?`,
        },
      ]);
      return;
    }

    setMessages([
      {
        role: "assistant",
        content:
          "Welcome to the rabbit hole. I’ll help you turn your staffing bottlenecks into a plain-English action plan.\n\n" +
          "**First question:** what kind of agency are you, and what problem is costing you the most time or money right now?",
      },
    ]);
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setInput("");
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/plan-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          projectName,
          projectBrief,
          funnelData: funnelState,
        }),
      });
      const data = await res.json();

      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "I updated your draft plan in the sidebar.";

      setMessages([...nextMessages, { role: "assistant", content: reply }]);
      if (data.projectName) setProjectName(data.projectName);
      if (data.projectBrief) setProjectBrief(data.projectBrief);
      if (typeof data.readyToBuild === "boolean") setReadyToBuild(data.readyToBuild);
      if (data.funnelData) {
        setFunnelState({
          agencyType: data.funnelData.agencyType || null,
          ats: data.funnelData.ats || null,
          selectedProblems: Array.isArray(data.funnelData.selectedProblems)
            ? data.funnelData.selectedProblems
            : [],
          priorityOrder: Array.isArray(data.funnelData.priorityOrder)
            ? data.funnelData.priorityOrder
            : [],
          customProblems: Array.isArray(data.funnelData.customProblems)
            ? data.funnelData.customProblems
            : [],
          planSummary: data.funnelData.planSummary || null,
          journeyStage: data.funnelData.journeyStage || "discovery",
          helpMode: data.funnelData.helpMode || "undecided",
          auditInterest: Boolean(data.funnelData.auditInterest),
          leadCaptureReady: Boolean(data.funnelData.leadCaptureReady),
        });
      }
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Sorry, something went wrong. Try again?" },
      ]);
    } finally {
      setLoading(false);
    }
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

  async function handleLeadSave(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim()) return;

    setSavingLead(true);
    setLeadStatus(null);

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          agencyType: funnelState.agencyType,
          ats: funnelState.ats,
          selectedProblems: funnelState.selectedProblems,
          priorityOrder: funnelState.priorityOrder,
          customProblems: funnelState.customProblems,
          generatedPlanSummary: funnelState.planSummary,
          projectName,
          projectBrief,
          transcript: messages,
          transcriptSummary:
            funnelState.planSummary ||
            messages.filter((message) => message.role === "assistant").at(-1)?.content ||
            null,
          sourcePath: searchParams.get("idea") ? "/ideas" : "/plan",
          engagementMode: funnelState.helpMode,
          auditInterest: funnelState.auditInterest || funnelState.helpMode === "audit",
          sendPlanConsent,
          newsletterConsent,
          followUpConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not save your details.");
      }

      setLeadSaved(true);
      setLeadStatus({
        tone: data.syncStatus === "error" ? "warning" : "success",
        message: data.message,
      });
    } catch (error) {
      setLeadStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save your details right now.",
      });
    } finally {
      setSavingLead(false);
    }
  }

  const shouldShowLeadCapture =
    funnelState.leadCaptureReady ||
    Boolean(funnelState.planSummary) ||
    readyToBuild;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/85 p-8 mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
          Natural-Language Funnel
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Tell me your agency type. Tell me your biggest headaches. I’ll turn that into a plan.
        </h1>
        <p className="text-sm text-zinc-400 mt-3 max-w-3xl leading-7">
          We’ll sort you into the right agency bucket, prioritize the problems worth
          fixing first, map the plan in plain English, and then decide whether you
          want to solve it with AI or hand it to us for an audit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col min-h-[720px]">
          <div className="px-4 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
              Conversation
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Start with your agency type. We&apos;ll work toward a custom plan.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-7 ${
                    msg.role === "user"
                      ? "bg-blue-600/20 text-blue-100"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {renderMessage(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-400">
                  Thinking through the next question...
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
                placeholder="Tell me about your agency, ATS, or biggest bottleneck..."
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

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Agency Snapshot
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Agency Type</p>
                <p className="text-zinc-200">
                  {funnelState.agencyType || "We’ll identify this together in the chat."}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">ATS / Workflow Stack</p>
                <p className="text-zinc-200">
                  {funnelState.ats || "Still gathering this."}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Path</p>
                <p className="text-zinc-200">
                  {funnelState.helpMode === "audit"
                    ? "Done-for-you audit"
                    : funnelState.helpMode === "guided-diy"
                      ? "Guided DIY with AI"
                      : "Still deciding"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Problem Queue
            </h2>
            {funnelState.priorityOrder.length > 0 ? (
              <div className="space-y-2">
                {funnelState.priorityOrder.map((problem, index) => (
                  <div
                    key={`${problem}-${index}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
                  >
                    {index + 1}. {problem}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {PROBLEM_CATEGORIES.slice(0, 8).map((problem) => (
                  <span
                    key={problem.slug}
                    className="px-3 py-1.5 rounded-full bg-zinc-800 text-xs text-zinc-400"
                  >
                    {problem.label}
                  </span>
                ))}
              </div>
            )}
            {funnelState.customProblems.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Custom problems you added</p>
                <div className="flex flex-wrap gap-2">
                  {funnelState.customProblems.map((problem) => (
                    <span
                      key={problem}
                      className="px-3 py-1.5 rounded-full bg-blue-600/15 text-xs text-blue-300"
                    >
                      {problem}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Draft Plan
            </h2>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-7">
              {funnelState.planSummary ||
                "As the conversation sharpens, your plain-English action plan will show up here."}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Build Brief
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Candidate follow-up engine"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Brief</label>
                <textarea
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  placeholder="Your problem-by-problem build brief will land here..."
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

            <div className="grid gap-3 sm:grid-cols-2 mt-5">
              <button
                onClick={handleStartBuilding}
                disabled={!projectName.trim() || !projectBrief.trim() || starting}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  projectName.trim() && projectBrief.trim()
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {starting ? "Starting..." : "Solve This With Me"}
              </button>
              <a
                href={AUDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 rounded-xl text-center text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Do This For Me
              </a>
            </div>

            {readyToBuild && projectName && (
              <div className="bg-green-950/50 border border-green-800 rounded-lg p-3 mt-4">
                <p className="text-xs text-green-400">
                  Your brief is strong enough to start a guided build whenever you&apos;re ready.
                </p>
              </div>
            )}
          </div>

          {shouldShowLeadCapture && (
            <form
              onSubmit={handleLeadSave}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                Send Me My Custom Plan
              </h2>
              <p className="text-sm text-zinc-400 leading-7 mb-4">
                Want the custom plan and conversation transcript sent your way? Drop
                your details here. Newsletter and follow-up outreach are separate opt-ins.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  disabled={leadSaved}
                />
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="you@agency.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  disabled={leadSaved}
                />
              </div>

              <div className="space-y-2 mt-4 text-sm text-zinc-300">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={sendPlanConsent}
                    onChange={(e) => setSendPlanConsent(e.target.checked)}
                    disabled={leadSaved}
                  />
                  <span>Yes, send me the custom plan and transcript.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                    disabled={leadSaved}
                  />
                  <span>Yes, I want newsletter updates and new workflow ideas.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={followUpConsent}
                    onChange={(e) => setFollowUpConsent(e.target.checked)}
                    disabled={leadSaved}
                  />
                  <span>Yes, you can send me follow-up resources or audit outreach.</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingLead || leadSaved || !leadName.trim() || !leadEmail.trim()}
                className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {savingLead ? "Saving..." : leadSaved ? "Saved" : "Save My Plan"}
              </button>

              {leadStatus && (
                <div
                  className={`mt-4 rounded-lg border p-3 text-sm ${
                    leadStatus.tone === "success"
                      ? "border-green-800 bg-green-950/50 text-green-300"
                      : leadStatus.tone === "warning"
                        ? "border-amber-800 bg-amber-950/50 text-amber-300"
                        : "border-red-800 bg-red-950/50 text-red-300"
                  }`}
                >
                  {leadStatus.message}
                </div>
              )}
            </form>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Agency Buckets
            </h2>
            <div className="flex flex-wrap gap-2">
              {AGENCY_TYPES.map((agency) => (
                <span
                  key={agency.slug}
                  className="px-3 py-1.5 rounded-full bg-zinc-800 text-xs text-zinc-400"
                >
                  {agency.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-6 py-8 text-zinc-500">Loading...</div>
      }
    >
      <FunnelPageInner />
    </Suspense>
  );
}
