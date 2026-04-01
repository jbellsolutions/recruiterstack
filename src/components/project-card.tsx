import Link from "next/link";
import type { Project } from "@/lib/db";

const phaseColors: Record<string, string> = {
  intake: "bg-gray-500",
  planning: "bg-blue-500",
  design: "bg-purple-500",
  architecture: "bg-purple-500",
  scaffold: "bg-teal-500",
  implementation: "bg-indigo-500",
  review: "bg-orange-500",
  review_qa: "bg-orange-500",
  qa: "bg-orange-500",
  deploy: "bg-emerald-500",
  delivery: "bg-green-600",
};

const phaseAgents: Record<string, string> = {
  intake: "Atlas",
  planning: "Meridian",
  architecture: "Forge",
  design: "Palette",
  scaffold: "Conduit",
  implementation: "Coder-1",
  review: "Forge",
  qa: "Sentinel",
  deploy: "Conduit",
  delivery: "Atlas",
};

const healthDots: Record<string, string> = {
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  red: "bg-red-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ProjectCard({ project }: { project: Project }) {
  const phaseLabel = project.current_phase.replace("_", " ");
  const isBuilding = project.status === "active";
  const isDelivered = project.status === "delivered";
  const isBlocked = project.status === "blocked";
  const progressPercent = Math.round((project.phase_number / 7) * 100);
  const currentAgent = phaseAgents[project.current_phase] || "Team";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`block rounded-xl border bg-zinc-900 p-5 transition-colors ${
        isBuilding
          ? "border-blue-500/40 hover:border-blue-500/70"
          : isBlocked
            ? "border-red-500/40 hover:border-red-500/70"
            : isDelivered
              ? "border-green-500/40 hover:border-green-500/70"
              : "border-zinc-800 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white text-lg">{project.name}</h3>
        <span className={`w-3 h-3 rounded-full ${healthDots[project.health] || healthDots.green}`} />
      </div>

      {/* Building state — progress bar + agent */}
      {isBuilding && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <span className="text-xs text-blue-400 font-medium">
                {currentAgent} is working
              </span>
            </div>
            <span className="text-xs text-zinc-500">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 8)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full text-white ${phaseColors[project.current_phase] || "bg-gray-500"}`}
        >
          {phaseLabel}
        </span>
        <span className="text-xs text-zinc-500">{project.phase_number}/7</span>
      </div>

      <div className="flex justify-between text-xs text-zinc-500">
        <span>{project.status}</span>
        <span>{timeAgo(project.updated_at)}</span>
      </div>

      {/* Delivered */}
      {isDelivered && (
        <div className="mt-3 bg-green-950/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-green-400">&#10003;</span>
            <span className="text-xs text-green-400 font-medium">Delivered — Ready to use</span>
          </div>
          {project.github_url && (
            <p className="text-xs text-green-500/60 mt-1 truncate">{project.github_url}</p>
          )}
        </div>
      )}

      {/* Blocked */}
      {isBlocked && (
        <div className="mt-3 bg-red-950/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-red-400">!</span>
            <span className="text-xs text-red-400 font-medium">Needs attention</span>
          </div>
          {project.error && (
            <p className="text-xs text-red-500/60 mt-1 truncate">{project.error}</p>
          )}
        </div>
      )}
    </Link>
  );
}
