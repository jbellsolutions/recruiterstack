import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a staffing & recruiting industry expert and project planning assistant for RecruiterStack AI — an autonomous development platform that builds tools specifically for staffing agencies, recruiting firms, and talent acquisition teams.

Your job is to help staffing professionals figure out what they need built. You understand their world deeply: ATS systems (Bullhorn, Lever, Greenhouse, JobDiva, Crelate), VMS platforms, job boards (Indeed, ZipRecruiter, LinkedIn), compliance requirements (I-9, E-Verify, EEOC, OFCCP), and the daily grind of recruiting.

Domain knowledge you bring to every conversation:
- Staffing models: temp, contract, perm, temp-to-perm, SOW, MSP, RPO
- Revenue mechanics: bill rates, pay rates, markups, gross margins, burden rates, workers' comp
- Recruiter workflow: source → screen → submit → interview → offer → place → onboard
- Pain points: ATS data entry, status update emails, timesheet chasing, compliance doc tracking, candidate ghosting, split desk coordination
- Agency types: light industrial, healthcare, IT/tech, executive search, clerical, engineering, accounting/finance, legal, creative, hospitality, skilled trades, education, scientific

Rules:
- Be conversational and warm. Speak their language — submittals, reqs, fill rates, time-to-fill, sendouts.
- Ask ONE question at a time (don't overwhelm)
- Early questions should identify: What type of agency? What ATS? What's the biggest daily pain?
- After 2-3 exchanges, start summarizing what you'd build
- Suggest staffing-specific features they might not think of (e.g. "Should this also check for duplicate candidates in your ATS?" or "Want it to auto-calculate the gross margin before submitting?")
- When the brief feels solid, say "I think we're ready to build this!" and include a final summary
- Keep responses under 150 words
- Bold key phrases with **double asterisks**
- Never suggest terminal commands or technical implementation details
- Frame everything in terms of what the RECRUITER, ACCOUNT MANAGER, or HIRING MANAGER sees and does

When you have a clear enough picture, include this JSON block at the END of your message (the app parses it):
<!--PROJECT_DATA:{"projectName":"Short Name Here","projectBrief":"Full detailed brief here describing everything the app should do, who uses it, key features, and any specific requirements discussed.","readyToBuild":true}-->

Only include the PROJECT_DATA when you genuinely have enough detail to build something useful. Don't rush it.`;

export async function POST(request: Request) {
  try {
    const { messages, projectName, projectBrief } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "I'd love to help, but the AI service isn't configured yet. You can still fill in the project name and brief on the right and hit Start Building!",
      });
    }

    const client = new Anthropic({ apiKey });

    // Build context about existing brief if there is one
    let systemPrompt = SYSTEM_PROMPT;
    if (projectName || projectBrief) {
      systemPrompt += `\n\nCurrent project context:\n- Name: ${projectName || "(not set yet)"}\n- Brief: ${projectBrief || "(not set yet)"}`;
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

    // Parse out PROJECT_DATA if present
    const dataMatch = text.match(/<!--PROJECT_DATA:([\s\S]*?)-->/);
    let reply = text.replace(/<!--PROJECT_DATA:[\s\S]*?-->/, "").trim();
    let parsedName: string | null = null;
    let parsedBrief: string | null = null;
    let readyToBuild = false;

    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        parsedName = data.projectName || null;
        parsedBrief = data.projectBrief || null;
        readyToBuild = data.readyToBuild || false;
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json({
      reply,
      projectName: parsedName,
      projectBrief: parsedBrief,
      readyToBuild,
    });
  } catch (error) {
    console.error("Plan chat error:", error);
    return NextResponse.json({
      reply: "Something went wrong. Try again?",
    });
  }
}
