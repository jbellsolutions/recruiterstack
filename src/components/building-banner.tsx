"use client";

const phaseAgents: Record<string, { name: string; action: string }> = {
  intake: { name: "Atlas", action: "Reviewing your project brief" },
  planning: { name: "Meridian", action: "Breaking down features and creating the build plan" },
  architecture: { name: "Forge", action: "Designing the technical architecture" },
  design: { name: "Palette", action: "Creating the visual design system" },
  scaffold: { name: "Conduit", action: "Setting up the project structure and tools" },
  implementation: { name: "Coder-1", action: "Writing code and running tests" },
  review: { name: "Forge", action: "Reviewing code quality and architecture compliance" },
  qa: { name: "Sentinel", action: "Running quality checks and fixing issues" },
  deploy: { name: "Conduit", action: "Deploying to production" },
  delivery: { name: "Atlas", action: "Packaging the final repo for delivery" },
};

export function BuildingBanner({ phase, phaseNumber }: { phase: string; phaseNumber: number }) {
  const info = phaseAgents[phase] || { name: "Team", action: "Working on your project" };
  const progressPercent = Math.round((phaseNumber / 7) * 100);

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-5 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
        </span>
        <h2 className="text-lg font-semibold text-blue-300">Your project is being built</h2>
      </div>
      <p className="text-sm text-blue-400/80 mb-4">
        <strong>{info.name}</strong> is working right now — {info.action.toLowerCase()}.
        You can watch the live build log below.
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-blue-950 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(progressPercent, 5)}%` }}
          />
        </div>
        <span className="text-sm text-blue-400 font-medium">{progressPercent}%</span>
      </div>
      <p className="text-xs text-blue-500/50 mt-2">
        This page auto-refreshes. You can close it and come back — building continues in the background.
      </p>
    </div>
  );
}
