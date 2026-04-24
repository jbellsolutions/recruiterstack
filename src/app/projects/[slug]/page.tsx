import { getProject } from "@/lib/db";
import { PhaseTimeline } from "@/components/phase-timeline";
import { ProjectChat } from "@/components/project-chat";
import { LogStream } from "@/components/log-stream";
import { BuildingBanner } from "@/components/building-banner";
import { RefreshWrapper } from "@/components/refresh-wrapper";
import { AUDIT_URL } from "@/lib/funnel-data";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const healthLabel: Record<string, string> = {
    green: "Healthy",
    yellow: "Warning",
    red: "Critical",
  };

  const isBuilding = project.status === "active";

  return (
    <RefreshWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 inline-block">
          &larr; Back to Rabbit Hole
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {project.slug} | {project.status} | {healthLabel[project.health] || project.health}
              {project.provider && ` | ${project.provider}`}
            </p>
          </div>
          <div className="flex gap-2">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors">
                GitHub
              </a>
            )}
            {project.production_url && (
              <a href={project.production_url} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors">
                View Live
              </a>
            )}
          </div>
        </div>

        {/* Building Banner */}
        {isBuilding && (
          <BuildingBanner phase={project.current_phase} phaseNumber={project.phase_number} />
        )}

        {/* Delivered Banner */}
        {project.status === "delivered" && (
          <div className="rounded-xl border border-green-800 bg-green-950 p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-green-400 text-lg">&#10003;</span>
              <h2 className="text-lg font-semibold text-green-300">Your project is ready!</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-green-900/30 rounded-lg p-4">
                <p className="text-sm font-medium text-green-300 mb-2">How to get started:</p>
                <ol className="text-sm text-green-400/80 space-y-2 list-decimal list-inside">
                  <li>Download <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">Claude Code</a> (free desktop app) if you don&apos;t have it</li>
                  <li>
                    {project.github_url ? (
                      <>Open Claude Code and say: <strong>&quot;Clone {project.github_url} and set it up for me&quot;</strong></>
                    ) : (
                      <>Open the project folder in Claude Code and say: <strong>&quot;Set this up for me&quot;</strong></>
                    )}
                  </li>
                  <li>Claude handles everything from there — you just answer its questions</li>
                </ol>
              </div>
              {project.github_url && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500/60">Repository:</span>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:text-green-300 underline">{project.github_url}</a>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={AUDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Want Help Rolling This Out?
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {project.status === "blocked" && project.error && (
          <div className="rounded-xl border border-red-800 bg-red-950 p-5 mb-6">
            <h2 className="text-sm font-semibold text-red-400 mb-1">Pipeline Blocked</h2>
            <p className="text-sm text-red-300">{project.error}</p>
          </div>
        )}

        {/* Phase Timeline */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wide">Progress</h2>
          <PhaseTimeline currentPhase={project.current_phase} phaseNumber={project.phase_number} />
        </div>

        {/* Brief */}
        {project.brief && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Brief</h2>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{project.brief}</p>
          </div>
        )}

        {/* Build Log (always visible during build) */}
        <div className="mb-6">
          <LogStream slug={project.slug} />
        </div>

        {/* Chat */}
        <div className="mb-6">
          <ProjectChat slug={project.slug} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Created</p>
            <p className="text-sm text-zinc-300">{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Provider</p>
            <p className="text-sm text-zinc-300">{project.provider || "anthropic"}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500">Last Updated</p>
            <p className="text-sm text-zinc-300">{new Date(project.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </RefreshWrapper>
  );
}
