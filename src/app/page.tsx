import Link from "next/link";
import { getProjects, getTeamStatus } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { TeamRoster } from "@/components/team-roster";
import { NewProjectForm } from "@/components/new-project-form";
import { RefreshWrapper } from "@/components/refresh-wrapper";
import {
  AGENCY_TYPES,
  AUDIT_URL,
  PROBLEM_CATEGORIES,
} from "@/lib/funnel-data";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const projects = await getProjects();
  const team = await getTeamStatus();

  const active = projects.filter((p) => p.status === "active").length;
  const delivered = projects.filter((p) => p.status === "delivered").length;

  return (
    <RefreshWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(140deg,rgba(15,23,42,0.96),rgba(9,9,11,0.92))] p-8 md:p-10 mb-8 shadow-2xl shadow-blue-950/20">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80 mb-3">
                Made For Staffing And Recruiting Agencies
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white max-w-3xl">
                Welcome to the rabbit hole.
              </h1>
              <p className="text-lg text-zinc-300 mt-4 max-w-2xl leading-8">
                Tell RecruiterStack what kind of agency you run, which bottlenecks are
                costing you the most, and what order you want to fix them in. It
                will turn that into a plain-English plan you can execute with Claude
                Code, Codex, or hand off to us for an audit.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href="/plan"
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-medium text-white transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/ideas"
                  className="px-5 py-3 rounded-full border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-200 transition-colors"
                >
                  Browse Problems & Solutions
                </Link>
                <a
                  href={AUDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-sm font-medium text-emerald-200 transition-colors"
                >
                  Book An Audit
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 mt-8">
                {[
                  "1. Pick your agency type",
                  "2. Prioritize your biggest problems",
                  "3. Leave with a custom plan",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4 text-sm text-zinc-200"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-blue-500/20 bg-zinc-950/80 p-5">
              <div className="aspect-video rounded-[18px] border border-dashed border-blue-400/35 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%),rgba(3,7,18,0.85)] p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300/70">
                    Video Placeholder
                  </p>
                  <h2 className="text-xl font-semibold text-white mt-3">
                    Put your walkthrough here
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2 leading-6">
                    Show the repo link dropped into Claude Code or Codex, the agency
                    type selection, problem prioritization, and the finished plan.
                  </p>
                </div>
                <p className="text-xs text-zinc-500">
                  “Tell me your agency type, your ATS, and the problems eating your team alive.”
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
              Agency Buckets
            </p>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Start with what kind of agency you are
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {AGENCY_TYPES.map((agency) => (
                <div
                  key={agency.slug}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <p className="text-sm font-medium text-white">{agency.label}</p>
                  <p className="text-xs text-zinc-400 mt-2 leading-5">
                    {agency.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
              Core Problems
            </p>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Then choose what you want fixed first
            </h2>
            <div className="grid gap-3">
              {PROBLEM_CATEGORIES.map((problem) => (
                <div
                  key={problem.slug}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <p className="text-sm font-medium text-white">{problem.label}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-5">
                    {problem.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
              What Happens Next
            </p>
            <h2 className="text-2xl font-semibold text-white mb-4">
              The process is simple on purpose
            </h2>
            <div className="space-y-4 text-sm text-zinc-300 leading-7">
              <p>
                RecruiterStack asks what bucket you fit into, what ATS or workflow
                stack you already use, and which operational headaches you want to
                solve now versus later.
              </p>
              <p>
                After that, it gives you a problem-by-problem plan in natural
                language. If you want to execute it with AI, keep going in Claude
                Code or Codex. If you want our team to do it for you, book the audit.
              </p>
              <p>
                At the end, it can capture your name and email so we can send the
                custom plan and transcript. Newsletter and follow-up outreach are
                separate opt-ins.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
                Need A Shortcut?
              </p>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Skip straight to a build or an audit
              </h2>
              <p className="text-sm text-zinc-400 leading-7 mb-5">
                If you already know the workflow you want, launch a guided build.
                If you want us to diagnose and scope it for you, take the audit route.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NewProjectForm />
              <a
                href={AUDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Audit My Agency
              </a>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Guided Builds</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {projects.length} projects | {active} building | {delivered} delivered
            </p>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center mb-8">
            <p className="text-zinc-500 mb-2">No guided builds yet</p>
            <p className="text-sm text-zinc-600">
              Start above, or skip straight to a build when you already know the workflow you want.
            </p>
          </div>
        )}

        <TeamRoster team={team} />

        <div className="mt-8 text-center text-xs text-zinc-700">
          Auto-refreshes every 10s | Guided builds run server-side on Railway
        </div>
      </div>
    </RefreshWrapper>
  );
}
