import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  AGENCY_TYPES,
  AUDIT_URL,
  PROBLEM_CATEGORIES,
} from "@/lib/funnel-data";
import { recommendAgentsFor } from "../../../../orchestrator/agents";

function normalizeProblemToSlug(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const bySlug = PROBLEM_CATEGORIES.find((p) => p.slug === trimmed);
  if (bySlug) return bySlug.slug;
  const byLabel = PROBLEM_CATEGORIES.find(
    (p) => p.label.toLowerCase() === trimmed,
  );
  if (byLabel) return byLabel.slug;
  // Loose contains match (model may write "candidate sourcing" without "& Pipeline").
  const loose = PROBLEM_CATEGORIES.find(
    (p) =>
      p.label.toLowerCase().includes(trimmed) ||
      trimmed.includes(p.label.toLowerCase()),
  );
  return loose?.slug ?? null;
}

const agencyTypeLabels = AGENCY_TYPES.map((item) => item.label).join(", ");
const problemLabels = PROBLEM_CATEGORIES.map((item) => item.label).join(", ");

const SYSTEM_PROMPT = `You are the natural-language funnel guide for RecruiterStack AI.

Your tone:
- Warm, direct, and easy for non-technical staffing owners to follow
- Feels like a smart operator, not a software wizard
- Uses staffing language naturally: reqs, submittals, fill rate, recruiter bandwidth, compliance, timesheets, ghosting

Your job:
1. Welcome them into the "rabbit hole" and make it feel simple.
2. Identify what kind of staffing agency they are.
3. Identify their ATS or current workflow stack.
4. Help them pick which problems they actually want to solve.
5. Confirm the order they want to tackle those problems in.
6. Build a concise, problem-by-problem action plan.
7. Ask whether they want guided DIY help or a done-for-you audit.
8. After value is delivered, ask for name + email so you can send the custom plan and transcript.
9. Make it clear that newsletter/follow-up consent is separate and optional.

Known agency buckets:
${agencyTypeLabels}

Known problem categories:
${problemLabels}

Conversation rules:
- Ask one question at a time until the plan is clear.
- Keep responses under 170 words.
- Never mention code, terminal commands, frameworks, or implementation details unless the user explicitly asks.
- Prefer simple language over technical language.
- When you have enough detail, give a short action plan with numbered steps.
- If they want done-for-you help, mention the audit link: ${AUDIT_URL}
- If they want to work through it together, encourage that and explain you can keep going step by step.
- Contact capture happens at the end, after the plan has real value.

Always include this metadata block at the end of EVERY reply:
<!--FUNNEL_DATA:{"projectName":null,"projectBrief":null,"readyToBuild":false,"agencyType":null,"ats":null,"selectedProblems":[],"priorityOrder":[],"customProblems":[],"planSummary":null,"journeyStage":"discovery","helpMode":"undecided","auditInterest":false,"leadCaptureReady":false}-->

Metadata rules:
- Use "journeyStage" values from: welcome, discovery, priorities, planning, decision, capture
- Use "helpMode" values from: guided-diy, audit, undecided
- Set "readyToBuild" to true only when the plan is specific enough to create a useful build brief
- Set "leadCaptureReady" to true only after you have delivered the plan and the user understands the next step
- "selectedProblems" should contain the actual problems they want solved
- "priorityOrder" should preserve the order they want to tackle them
- "customProblems" should capture problems they mention that are not already obvious from the known categories
- "planSummary" should be a concise plain-English summary of the plan
- "projectName" should be a short, clear project name when possible
- "projectBrief" should describe the full plan in plain English for the build team
- If the user explicitly wants an audit, set "auditInterest" true and "helpMode" to "audit"
- If the user wants to solve it together, set "helpMode" to "guided-diy"`;

interface FunnelData {
  projectName: string | null;
  projectBrief: string | null;
  readyToBuild: boolean;
  agencyType: string | null;
  ats: string | null;
  selectedProblems: string[];
  priorityOrder: string[];
  customProblems: string[];
  planSummary: string | null;
  journeyStage: string;
  helpMode: string;
  auditInterest: boolean;
  leadCaptureReady: boolean;
}

const DEFAULT_FUNNEL_DATA: FunnelData = {
  projectName: null,
  projectBrief: null,
  readyToBuild: false,
  agencyType: null,
  ats: null,
  selectedProblems: [],
  priorityOrder: [],
  customProblems: [],
  planSummary: null,
  journeyStage: "discovery",
  helpMode: "undecided",
  auditInterest: false,
  leadCaptureReady: false,
};

export async function POST(request: Request) {
  try {
    const { messages, projectName, projectBrief, funnelData } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const incomingProblems = Array.isArray(funnelData?.selectedProblems)
        ? funnelData.selectedProblems
        : [];
      const slugs = incomingProblems
        .map((p: unknown) => (typeof p === "string" ? normalizeProblemToSlug(p) : null))
        .filter((s: string | null): s is string => Boolean(s));
      let recommendedAgents: string[] = [];
      try {
        recommendedAgents = await recommendAgentsFor(Array.from(new Set(slugs)));
      } catch {
        recommendedAgents = [];
      }
      return NextResponse.json({
        reply: "I can still help you outline this manually, but the AI guide is not configured yet. Use the sidebar to capture the agency type, top problems, and your contact details, or book an audit if you want us to do the heavy lifting.",
        funnelData: DEFAULT_FUNNEL_DATA,
        recommendedAgents,
      });
    }

    const client = new Anthropic({ apiKey });

    let systemPrompt = SYSTEM_PROMPT;
    if (projectName || projectBrief) {
      systemPrompt += `\n\nCurrent project context:\n- Name: ${projectName || "(not set yet)"}\n- Brief: ${projectBrief || "(not set yet)"}`;
    }
    if (funnelData) {
      systemPrompt += `\n\nCurrent funnel state:\n${JSON.stringify(funnelData, null, 2)}`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    const dataMatch = text.match(/<!--FUNNEL_DATA:([\s\S]*?)-->/);
    const reply = text.replace(/<!--FUNNEL_DATA:[\s\S]*?-->/, "").trim();
    const parsedData: FunnelData = { ...DEFAULT_FUNNEL_DATA };

    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        parsedData.projectName =
          typeof data.projectName === "string" && data.projectName.trim()
            ? data.projectName.trim()
            : null;
        parsedData.projectBrief =
          typeof data.projectBrief === "string" && data.projectBrief.trim()
            ? data.projectBrief.trim()
            : null;
        parsedData.readyToBuild = Boolean(data.readyToBuild);
        parsedData.agencyType =
          typeof data.agencyType === "string" && data.agencyType.trim()
            ? data.agencyType.trim()
            : null;
        parsedData.ats =
          typeof data.ats === "string" && data.ats.trim() ? data.ats.trim() : null;
        parsedData.selectedProblems = Array.isArray(data.selectedProblems)
          ? data.selectedProblems.filter((item: unknown): item is string => typeof item === "string")
          : [];
        parsedData.priorityOrder = Array.isArray(data.priorityOrder)
          ? data.priorityOrder.filter((item: unknown): item is string => typeof item === "string")
          : [];
        parsedData.customProblems = Array.isArray(data.customProblems)
          ? data.customProblems.filter((item: unknown): item is string => typeof item === "string")
          : [];
        parsedData.planSummary =
          typeof data.planSummary === "string" && data.planSummary.trim()
            ? data.planSummary.trim()
            : null;
        parsedData.journeyStage =
          typeof data.journeyStage === "string" && data.journeyStage.trim()
            ? data.journeyStage.trim()
            : DEFAULT_FUNNEL_DATA.journeyStage;
        parsedData.helpMode =
          typeof data.helpMode === "string" && data.helpMode.trim()
            ? data.helpMode.trim()
            : DEFAULT_FUNNEL_DATA.helpMode;
        parsedData.auditInterest = Boolean(data.auditInterest);
        parsedData.leadCaptureReady = Boolean(data.leadCaptureReady);
      } catch {
        // ignore parse errors
      }
    }

    const problemSlugs = [
      ...parsedData.priorityOrder,
      ...parsedData.selectedProblems,
    ]
      .map(normalizeProblemToSlug)
      .filter((s): s is string => Boolean(s));
    const uniqueSlugs = Array.from(new Set(problemSlugs));
    let recommendedAgents: string[] = [];
    try {
      recommendedAgents = await recommendAgentsFor(uniqueSlugs);
    } catch {
      recommendedAgents = [];
    }

    return NextResponse.json({
      reply,
      projectName: parsedData.projectName,
      projectBrief: parsedData.projectBrief,
      readyToBuild: parsedData.readyToBuild,
      funnelData: parsedData,
      recommendedAgents,
    });
  } catch (error) {
    console.error("Plan chat error:", error);
    return NextResponse.json({
      reply: "Something went wrong. Try again?",
      funnelData: DEFAULT_FUNNEL_DATA,
    });
  }
}
