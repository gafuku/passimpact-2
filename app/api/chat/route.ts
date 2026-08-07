import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";
import { clientIp, rateLimit } from "@/app/lib/rateLimit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message can't be empty").max(2000, "Message is too long"),
  reportId: z.string().min(1),
  sessionId: z.string().min(1).nullable().optional(),
  history: z
    .array(z.object({ id: z.union([z.number(), z.string()]), role: z.string(), text: z.string() }))
    .optional()
    .default([]),
});

function formatBillions(value: number | undefined) {
  return typeof value === "number" ? `$${value.toFixed(2)}B` : "Not disclosed";
}

function formatPercent(value: number | undefined) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "Not disclosed";
}

async function buildSystemPrompt(reportId: string) {
  const report = await withDbRetry(() =>
    prisma.report.findUnique({
      where: { id: reportId },
      include: { institution: true, lineItems: true },
    })
  );

  if (!report) return null;

  const previousReport = await withDbRetry(() =>
    prisma.report.findFirst({
      where: { institutionId: report.institutionId, year: { lt: report.year } },
      orderBy: { year: "desc" },
    })
  );

  const revenueBreakdown = report.lineItems
    .filter((l) => l.type === "REVENUE")
    .map((l) => `${l.label}: ${formatBillions(l.value)}`)
    .join("; ") || "Not disclosed";

  const expenseBreakdown = report.lineItems
    .filter((l) => l.type === "EXPENSE")
    .map((l) => `${l.label}: ${formatBillions(l.value)}`)
    .join("; ") || "Not disclosed";

  const priorYearLine = previousReport
    ? `Prior year on file (${previousReport.fy}): Total Revenue ${formatBillions(previousReport.totalRevenue)}, Total Expenses ${formatBillions(previousReport.totalExpenses)}, Endowment ${formatBillions(previousReport.endowment)}.`
    : "No prior year report is on file for this institution.";

  return `You are a financial analyst AI for Pass Impact, helping a donor understand a university's audited financial report. Answer concisely.

Institution: ${report.institution.name}
Fiscal Year: ${report.fy} (ended ${report.fiscalYearEnd})
Audit Opinion: ${report.auditOpinion}

Headline figures:
- Total Revenue: ${formatBillions(report.totalRevenue)}
- Total Expenses: ${formatBillions(report.totalExpenses)}
- Net Position Change: ${formatBillions(report.netPosition)}
- Private Gifts (Operating): ${formatBillions(report.privateGiftsOperating)}

Balance sheet:
- Total Assets: ${formatBillions(report.totalAssets)}
- Total Liabilities: ${formatBillions(report.totalLiabilities)}
- Total Net Assets: ${formatBillions(report.totalNetAssets)}
- Total Debt: ${formatBillions(report.totalDebt)}

Revenue by source: ${revenueBreakdown}
Expenses by function: ${expenseBreakdown}

Endowment & Lockbox:
- Endowment: ${formatBillions(report.endowment)}
- Permanently Restricted Share: ${formatPercent(report.lockboxPermanentlyRestricted)}
- Board Designated Share: ${formatPercent(report.lockboxBoardDesignated)}
- Annual Spending Rate: ${formatPercent(report.lockboxSpendingRate)}
- Annual Payout: ${formatBillions(report.lockboxAnnualPayout)}

${priorYearLine}

Rules:
- Answer only using the data above or the conversation history — never outside knowledge about this institution.
- If the answer isn't in the data provided, say plainly that it isn't disclosed in this report. Never guess or estimate.
- Cite which part of the report a figure comes from when relevant (e.g. "Statement of Activities", "Endowment Note").
- All amounts are in billions of US dollars unless stated otherwise.`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    // Chat calls a paid, quota-limited model and this endpoint is reachable by
    // guests too, so it's throttled per signed-in user or per IP for guests.
    const limitKey = session?.user?.id ? `chat:user:${session.user.id}` : `chat:ip:${clientIp(req)}`;
    const { ok, retryAfterMs } = rateLimit(limitKey, 15, 5 * 60 * 1000);
    if (!ok) {
      return NextResponse.json(
        { error: "You're sending messages too quickly. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const parsed = chatRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    const { message, reportId, sessionId, history } = parsed.data;

    // Guests get a real answer too — it just isn't saved anywhere. Only a signed-in user
    // gets a ChatSession. Omitting sessionId always starts a brand-new thread; passing one
    // continues that specific past conversation instead of collapsing everything into one.
    let chatSessionId: string | null = null;
    if (session?.user?.id) {
      if (sessionId) {
        const existing = await withDbRetry(() =>
          prisma.chatSession.findFirst({ where: { id: sessionId, userId: session.user.id, reportId } })
        );
        chatSessionId = existing?.id ?? null;
      }

      if (!chatSessionId) {
        chatSessionId = (await withDbRetry(() => prisma.chatSession.create({ data: { userId: session.user.id, reportId } }))).id;
      }

      await withDbRetry(() => prisma.chatMessage.create({ data: { chatSessionId: chatSessionId!, role: "user", content: message } }));
    }

    const formattedHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const systemPrompt = await buildSystemPrompt(reportId);
    if (!systemPrompt) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let aiMessage: string;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I will act as the financial analyst, grounded only in that data." }] },
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] },
        ],
      });
      aiMessage = response.text || "I'm sorry, I couldn't generate a response.";
    } catch (aiError) {
      console.error("Gemini generateContent error:", aiError);
      return NextResponse.json(
        { error: "The assistant is temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    if (chatSessionId) {
      await withDbRetry(() => prisma.chatMessage.create({ data: { chatSessionId: chatSessionId!, role: "model", content: aiMessage } }));
    }

    return NextResponse.json({ text: aiMessage, sessionId: chatSessionId });
  } catch (error) {
    return apiError(error, "POST /api/chat");
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");
    const sessionId = searchParams.get("sessionId");

    if (!session?.user?.id || !reportId) {
      return NextResponse.json({ messages: [], sessionId: null });
    }

    const chatSession = await withDbRetry(() =>
      sessionId
        ? prisma.chatSession.findFirst({
            where: { id: sessionId, userId: session.user.id, reportId },
            include: { messages: { orderBy: { createdAt: "asc" } } },
          })
        : prisma.chatSession.findFirst({
            where: { userId: session.user.id, reportId },
            orderBy: { createdAt: "desc" },
            include: { messages: { orderBy: { createdAt: "asc" } } },
          })
    );

    const messages =
      chatSession?.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === "user" ? "user" : "assistant",
        text: msg.content,
      })) ?? [];

    return NextResponse.json({ messages, sessionId: chatSession?.id ?? null });
  } catch (error) {
    return apiError(error, "GET /api/chat");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const chatSession = await withDbRetry(() =>
      prisma.chatSession.findFirst({ where: { id: sessionId, userId: session.user.id } })
    );

    if (chatSession) {
      await withDbRetry(() => prisma.chatMessage.deleteMany({ where: { chatSessionId: chatSession.id } }));
      await withDbRetry(() => prisma.chatSession.delete({ where: { id: chatSession.id } }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "DELETE /api/chat");
  }
}
