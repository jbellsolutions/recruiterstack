import { NextResponse } from "next/server";
import {
  createProspect,
  getProspectById,
} from "@/lib/db";
import { SOURCE_REPO } from "@/lib/funnel-data";
import { syncProspectToWebhook } from "@/lib/prospect-sync";

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown): string | null {
  const trimmed = asTrimmedString(value);
  return trimmed ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asTranscript(
  value: unknown
): Array<{ role: string; content: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { role: string; content: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof item.role === "string" &&
        typeof item.content === "string"
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }))
    .filter((item) => item.content);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email).toLowerCase();
    const transcript = asTranscript(body.transcript);
    const generatedPlanSummary = asNullableString(body.generatedPlanSummary);
    const transcriptSummary =
      asNullableString(body.transcriptSummary) ||
      generatedPlanSummary ||
      transcript.at(-1)?.content ||
      null;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    const prospectId = await createProspect({
      name,
      email,
      agency_type: asNullableString(body.agencyType),
      ats: asNullableString(body.ats),
      selected_problems: asStringArray(body.selectedProblems),
      priority_order: asStringArray(body.priorityOrder),
      custom_problems: asStringArray(body.customProblems),
      generated_plan_summary: generatedPlanSummary,
      project_name: asNullableString(body.projectName),
      project_brief: asNullableString(body.projectBrief),
      transcript_json: transcript,
      transcript_summary: transcriptSummary,
      source_repo: SOURCE_REPO,
      source_path: asNullableString(body.sourcePath) || "/plan",
      engagement_mode: asNullableString(body.engagementMode),
      audit_interest: Boolean(body.auditInterest),
      send_plan_consent: Boolean(body.sendPlanConsent),
      newsletter_consent: Boolean(body.newsletterConsent),
      follow_up_consent: Boolean(body.followUpConsent),
    });

    const prospect = await getProspectById(prospectId);
    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect was saved, but could not be reloaded." },
        { status: 500 }
      );
    }

    const syncResult = await syncProspectToWebhook(prospect);

    return NextResponse.json({
      saved: true,
      prospectId,
      syncStatus: syncResult.status,
      destination: syncResult.destination,
      message: syncResult.message,
    });
  } catch (error) {
    console.error("Prospect save error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving this lead." },
      { status: 500 }
    );
  }
}
