import { NextResponse } from "next/server";
import { spawnAgents } from "../../../../orchestrator/spawn";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agents: string[] = Array.isArray(body?.agents) ? body.agents : [];
    const context = typeof body?.context === "object" && body.context ? body.context : {};

    if (agents.length === 0) {
      return NextResponse.json(
        { error: "No agents provided." },
        { status: 400 },
      );
    }

    const result = await spawnAgents({ agents, context });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Spawn error:", error);
    return NextResponse.json(
      { error: "Failed to spawn agents." },
      { status: 500 },
    );
  }
}
