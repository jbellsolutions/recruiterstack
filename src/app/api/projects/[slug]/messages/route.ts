import { NextRequest, NextResponse } from "next/server";
import { getProjectMessages, addMessage, respondToMessage } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const messages = await getProjectMessages(slug);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();

  // User responding to an agent question
  if (body.message_id && body.response) {
    await respondToMessage(body.message_id, body.response);
    return NextResponse.json({ ok: true });
  }

  // User posting a new message
  await addMessage({
    project_slug: slug,
    sender: body.sender || "user",
    role: body.role || "user",
    content: body.content,
    needs_response: body.needs_response || false,
  });

  return NextResponse.json({ ok: true });
}
