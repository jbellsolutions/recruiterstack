import { getProjects, getTeamStatus } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";
import { TeamRoster } from "@/components/team-roster";
import { NewProjectForm } from "@/components/new-project-form";
import { RefreshWrapper } from "@/components/refresh-wrapper";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const projects = await getProjects();
  const team = await getTeamStatus();

  const active = projects.filter((p) => p.status === "active").length;
  const delivered = projects.filter((p) => p.status === "delivered").length;

  return (
    <RefreshWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">RecruiterStack AI</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {projects.length} projects | {active} building | {delivered} delivered
            </p>
          </div>
          <NewProjectForm />
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center mb-8">
            <p className="text-zinc-500 mb-2">No projects yet</p>
            <p className="text-sm text-zinc-600">
              Click &quot;+ New Project&quot; above to get started. The team builds it automatically.
            </p>
          </div>
        )}

        {/* Team */}
        <TeamRoster team={team} />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-700">
          Auto-refreshes every 10s | Agents run server-side on Railway
        </div>
      </div>
    </RefreshWrapper>
  );
}
