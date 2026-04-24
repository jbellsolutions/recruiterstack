import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, getProject, getTeamStatus } from "@/lib/db";
import { runPipeline } from "@/lib/pipeline";

async function buildUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  let slug = baseSlug || "project";
  let counter = 2;

  while (await getProject(slug)) {
    const suffix = `-${counter}`;
    const trimmedBase = baseSlug.slice(0, Math.max(30 - suffix.length, 1)) || "project";
    slug = `${trimmedBase}${suffix}`;
    counter += 1;
  }

  return slug;
}

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

  const slug = await buildUniqueSlug(name);

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
