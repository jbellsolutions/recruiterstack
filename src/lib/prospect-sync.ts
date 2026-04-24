import {
  addProspectSyncEvent,
  type Prospect,
  updateProspectSyncStatus,
} from "@/lib/db";

const DEFAULT_DESTINATION = "primary-webhook";

function truncate(value: string, max = 4000): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export interface ProspectSyncResult {
  status: "success" | "skipped" | "error";
  destination: string;
  message: string;
}

export async function syncProspectToWebhook(
  prospect: Prospect
): Promise<ProspectSyncResult> {
  const destination = process.env.PROSPECT_WEBHOOK_NAME || DEFAULT_DESTINATION;
  const webhookUrl = process.env.PROSPECT_WEBHOOK_URL;
  const webhookToken = process.env.PROSPECT_WEBHOOK_TOKEN;

  const payload = {
    prospect: {
      id: prospect.id,
      name: prospect.name,
      email: prospect.email,
      agencyType: prospect.agency_type,
      ats: prospect.ats,
      selectedProblems: prospect.selected_problems,
      priorityOrder: prospect.priority_order,
      customProblems: prospect.custom_problems,
      generatedPlanSummary: prospect.generated_plan_summary,
      transcriptSummary: prospect.transcript_summary,
      projectName: prospect.project_name,
      projectBrief: prospect.project_brief,
      engagementMode: prospect.engagement_mode,
      auditInterest: prospect.audit_interest,
      sourceRepo: prospect.source_repo,
      sourcePath: prospect.source_path,
      createdAt: prospect.created_at,
    },
    consents: {
      sendPlan: prospect.send_plan_consent,
      newsletter: prospect.newsletter_consent,
      followUp: prospect.follow_up_consent,
    },
    transcript: prospect.transcript_json,
  };

  if (!webhookUrl) {
    await updateProspectSyncStatus(prospect.id, { sync_status: "skipped", sync_error: null });
    await addProspectSyncEvent({
      prospect_id: prospect.id,
      destination,
      status: "skipped",
      payload: JSON.stringify(payload),
      response: "PROSPECT_WEBHOOK_URL not configured",
    });
    return {
      status: "skipped",
      destination,
      message: "Lead saved locally. External sync is not configured yet.",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const responseText = truncate(await response.text());
    const status = response.ok ? "success" : "error";

    await updateProspectSyncStatus(prospect.id, {
      sync_status: status,
      sync_error: response.ok ? null : `Webhook returned ${response.status}`,
    });
    await addProspectSyncEvent({
      prospect_id: prospect.id,
      destination,
      status,
      payload: JSON.stringify(payload),
      response: `HTTP ${response.status}: ${responseText}`,
    });

    if (!response.ok) {
      return {
        status: "error",
        destination,
        message: "Lead saved locally, but the external sync returned an error.",
      };
    }

    return {
      status: "success",
      destination,
      message: "Lead saved locally and synced to your outbound stack.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await updateProspectSyncStatus(prospect.id, {
      sync_status: "error",
      sync_error: message,
    });
    await addProspectSyncEvent({
      prospect_id: prospect.id,
      destination,
      status: "error",
      payload: JSON.stringify(payload),
      response: truncate(message),
    });
    return {
      status: "error",
      destination,
      message: "Lead saved locally, but the external sync failed.",
    };
  }
}
