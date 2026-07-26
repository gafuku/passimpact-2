import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ sessions: [] });
  }

  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");
  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  const chatSessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id, reportId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  const sessions = chatSessions
    .filter((s) => s.messages.length > 0)
    .map((s) => {
      const first = s.messages[0];
      const last = s.messages[s.messages.length - 1];
      return {
        id: s.id,
        createdAt: s.createdAt.getTime(),
        lastActivity: last.createdAt.getTime(),
        messageCount: s.messages.length,
        preview: first.content,
      };
    })
    .sort((a, b) => b.lastActivity - a.lastActivity);

  return NextResponse.json({ sessions });
}
