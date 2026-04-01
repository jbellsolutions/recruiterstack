import { NextRequest } from "next/server";
import { getProjectLogs } from "@/lib/db";

// SSE endpoint for real-time log streaming
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      let lastId = 0;

      const send = (data: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
      };

      // Send initial logs
      const logs = await getProjectLogs(slug, 50);
      send(JSON.stringify({ type: "initial", logs: logs.reverse() }));
      if (logs.length > 0) lastId = logs[0].id;

      // Poll for new logs every 2 seconds
      const interval = setInterval(async () => {
        try {
          const newLogs = await getProjectLogs(slug, 10);
          const fresh = newLogs.filter((l) => l.id > lastId).reverse();
          if (fresh.length > 0) {
            send(JSON.stringify({ type: "update", logs: fresh }));
            lastId = Math.max(...fresh.map((l) => l.id));
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Clean up after 10 minutes (Railway timeout safety)
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 600000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
