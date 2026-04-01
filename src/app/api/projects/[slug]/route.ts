import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectLogs } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  const logs = await getProjectLogs(slug, 100);
  return NextResponse.json({ project, logs });
}
