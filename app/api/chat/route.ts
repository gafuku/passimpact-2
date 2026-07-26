import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function formatBillions(value: number | undefined) {
  return typeof value === "number" ? `$${value.toFixed(2)}B` : "Not disclosed";
}

function formatPercent(value: number | undefined) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "Not disclosed";
}

async function buildSystemPrompt(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { institution: true, lineItems: true },
  });

  if (!report) return null;

  const previousReport = await prisma.report.findFirst({
    where: { institutionId: report.institutionId, year: { lt: report.year } },
    orderBy: { year: "desc" },
  });

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
    const { message, reportId, sessionId, history = [] } = await req.json();

    if (!message || !reportId) {
      return NextResponse.json({ error: "Missing message or reportId" }, { status: 400 });
    }

    // Guests get a real answer too — it just isn't saved anywhere. Only a signed-in user
    // gets a ChatSession. Omitting sessionId always starts a brand-new thread; passing one
    // continues that specific past conversation instead of collapsing everything into one.
    let chatSessionId: string | null = null;
    if (session?.user?.id) {
      if (sessionId) {
        const existing = await prisma.chatSession.findFirst({
          where: { id: sessionId, userId: session.user.id, reportId },
        });
        chatSessionId = existing?.id ?? null;
      }

      if (!chatSessionId) {
        chatSessionId = (await prisma.chatSession.create({ data: { userId: session.user.id, reportId } })).id;
      }

      await prisma.chatMessage.create({
        data: { chatSessionId, role: "user", content: message },
      });
    }

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const systemPrompt = await buildSystemPrompt(reportId);
    if (!systemPrompt) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will act as the financial analyst, grounded only in that data." }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] },
      ],
    });

    const aiMessage = response.text || "I'm sorry, I couldn't generate a response.";

    if (chatSessionId) {
      await prisma.chatMessage.create({
        data: { chatSessionId, role: "model", content: aiMessage },
      });
    }

    return NextResponse.json({ text: aiMessage, sessionId: chatSessionId });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const chatSession = sessionId
      ? await prisma.chatSession.findFirst({
          where: { id: sessionId, userId: session.user.id, reportId },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : await prisma.chatSession.findFirst({
          where: { userId: session.user.id, reportId },
          orderBy: { createdAt: "desc" },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        });

    const messages =
      chatSession?.messages.map((msg) => ({
        id: msg.id,
        role: msg.role === "user" ? "user" : "assistant",
        text: msg.content,
      })) ?? [];

    return NextResponse.json({ messages, sessionId: chatSession?.id ?? null });
  } catch (error) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    });

    if (chatSession) {
      await prisma.chatMessage.deleteMany({ where: { chatSessionId: chatSession.id } });
      await prisma.chatSession.delete({ where: { id: chatSession.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
