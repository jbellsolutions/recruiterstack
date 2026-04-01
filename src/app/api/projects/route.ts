import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, getTeamStatus } from "@/lib/db";
import { runPipeline } from "@/lib/pipeline";

export async function GET() {
  const projects = await getProjects();
  const team = await getTeamStatus();
  return NextResponse.json({ projects, team });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, brief, provider, model } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  // Create project in database
  await createProject({
    slug,
    name,
    brief: brief || null,
    provider: provider || "anthropic",
    model: model || undefined,
  });

  // IMMEDIATELY start the pipeline (fire-and-forget)
  // This runs as a background async task in the same Node.js process
  runPipeline(slug).catch((err) => {
    console.error(`Pipeline error for ${slug}:`, err);
  });

  return NextResponse.json(
    { slug, name, status: "active", message: "Pipeline started" },
    { status: 201 }
  );
}
