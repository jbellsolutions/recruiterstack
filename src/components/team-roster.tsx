import type { TeamMember } from "@/lib/db";

const agentColors: Record<string, string> = {
  Atlas: "text-yellow-400",
  Meridian: "text-blue-400",
  Forge: "text-orange-400",
  Palette: "text-pink-400",
  "Coder-1": "text-indigo-400",
  "Coder-2": "text-violet-400",
  Sentinel: "text-red-400",
  Conduit: "text-emerald-400",
};

export function TeamRoster({ team }: { team: TeamMember[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Team</h2>
      <div className="space-y-2">
        {team.map((member) => (
          <div key={member.codename} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${agentColors[member.codename] || "text-white"}`}>
                {member.codename}
              </span>
              <span className="text-zinc-600 text-xs">{member.role}</span>
            </div>
            <div className="flex items-center gap-2">
              {member.current_project ? (
                <span className="text-xs text-zinc-400">{member.current_project}</span>
              ) : (
                <span className="text-xs text-zinc-600">idle</span>
              )}
              <span
                className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-green-400" : "bg-zinc-600"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
