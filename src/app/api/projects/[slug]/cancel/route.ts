import { NextRequest, NextResponse } from "next/server";
import { cancelPipeline } from "@/lib/pipeline";
import { updateProject, addLog } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cancelled = cancelPipeline(slug);

  if (cancelled) {
    await updateProject(slug, { status: "blocked", health: "yellow", error: "Cancelled by user" });
    await addLog({ project_slug: slug, agent_name: "Pipeline", level: "warn", message: "Pipeline cancelled by user" });
    return NextResponse.json({ ok: true, message: "Pipeline cancelled" });
  }

  return NextResponse.json({ ok: false, message: "No running pipeline found" }, { status: 404 });
}
