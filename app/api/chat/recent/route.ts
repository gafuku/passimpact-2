import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ chats: [] });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    include: {
      report: { include: { institution: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const chats = sessions
    .filter((s) => s.messages.length > 0)
    .map((s) => ({
      institutionSlug: s.report.institution.slug,
      institutionName: s.report.institution.name,
      year: s.report.year,
      lastMessage: s.messages[0].content,
      lastActivity: s.messages[0].createdAt.getTime(),
    }))
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, 6);

  return NextResponse.json({ chats });
}
