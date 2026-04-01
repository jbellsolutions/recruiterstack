const phases = [
  { key: "intake", label: "Brief", number: 1, agent: "Atlas" },
  { key: "planning", label: "Plan", number: 2, agent: "Meridian" },
  { key: "design", label: "Design", number: 3, agent: "Forge + Palette" },
  { key: "scaffold", label: "Setup", number: 4, agent: "Conduit" },
  { key: "implementation", label: "Build", number: 5, agent: "Coder-1/2" },
  { key: "qa", label: "QA", number: 6, agent: "Sentinel" },
  { key: "delivery", label: "Deliver", number: 7, agent: "Atlas" },
];

// Map actual phase keys from pipeline to timeline positions
const phaseToNumber: Record<string, number> = {
  intake: 1,
  planning: 2,
  architecture: 3,
  design: 3,
  scaffold: 4,
  implementation: 5,
  review: 6,
  qa: 6,
  deploy: 7,
  delivery: 7,
};

export function PhaseTimeline({ currentPhase, phaseNumber }: { currentPhase: string; phaseNumber: number }) {
  const mappedNumber = phaseToNumber[currentPhase] || phaseNumber;

  return (
    <div className="flex items-center gap-1 w-full">
      {phases.map((p, i) => {
        const isCompleted = p.number < mappedNumber;
        const isCurrent = p.number === mappedNumber;
        return (
          <div key={p.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500"
                }`}
              >
                {isCompleted ? "✓" : p.number}
              </div>
              <span className={`text-[10px] mt-1 ${isCurrent ? "text-blue-400 font-medium" : isCompleted ? "text-green-500" : "text-zinc-500"}`}>
                {p.label}
              </span>
              {isCurrent && (
                <span className="text-[9px] text-blue-400/60 mt-0.5">{p.agent}</span>
              )}
            </div>
            {i < phases.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-2 transition-all ${isCompleted ? "bg-green-500" : "bg-zinc-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
