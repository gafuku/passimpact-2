import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Convert the uploaded File to a base64 string
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      You are an expert financial analyst reviewing an annual financial report for a university.
      Extract the core structural data points exactly as requested by the schema.
      Focus on the consolidated statement of financial position (balance sheet) and the statement of activities (operations).
      Ensure values are in billions (e.g. 52.4 for $52.4B) where appropriate for major figures, but be exact if requested.
      Identify the institution's full legal name from the cover page or letterhead — this is required for matching the
      report to the right university record.
    `;

    // Define the schema for structured output
    const lineItemSchema = {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        value: { type: Type.NUMBER, description: "Value in billions (e.g. 1.25)" }
      },
      required: ["label", "value"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type || "application/pdf"
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            institutionName: { type: Type.STRING, description: "The institution's full legal name, e.g. 'University of Michigan'" },
            institutionLocation: { type: Type.STRING, description: "City, State the institution is based in, if identifiable" },
            year: { type: Type.INTEGER, description: "The fiscal year (e.g. 2025)" },
            fy: { type: Type.STRING, description: "Formatted fiscal year (e.g. 'FY2025')" },
            fiscalYearEnd: { type: Type.STRING, description: "Date of fiscal year end (e.g. 'June 30, 2025')" },
            published: { type: Type.STRING, description: "Publication date (e.g. 'October 2025')" },
            auditOpinion: { type: Type.STRING, description: "Audit opinion (e.g. 'Unmodified')" },
            totalRevenue: { type: Type.NUMBER, description: "Total operating revenue in billions" },
            totalExpenses: { type: Type.NUMBER, description: "Total operating expenses in billions" },
            netPosition: { type: Type.NUMBER, description: "Net position change from operations in billions" },
            totalAssets: { type: Type.NUMBER, description: "Total assets in billions" },
            totalLiabilities: { type: Type.NUMBER, description: "Total liabilities in billions" },
            totalNetAssets: { type: Type.NUMBER, description: "Total net assets in billions" },
            totalDebt: { type: Type.NUMBER, description: "Total debt (bonds & notes payable) in billions" },
            endowment: { type: Type.NUMBER, description: "Total endowment value in billions" },
            privateGiftsOperating: { type: Type.NUMBER, description: "Private gifts for current use/operations in billions" },
            revenueBySource: { type: Type.ARRAY, items: lineItemSchema, description: "Breakdown of operating revenues" },
            expenseByFunction: { type: Type.ARRAY, items: lineItemSchema, description: "Breakdown of operating expenses" },
            lockboxEndowmentTotal: { type: Type.NUMBER, description: "Total endowment in billions" },
            lockboxPermanentlyRestricted: { type: Type.NUMBER, description: "Share of endowment that is permanently restricted (0.0 to 1.0)" },
            lockboxBoardDesignated: { type: Type.NUMBER, description: "Share of endowment that is board designated (0.0 to 1.0)" },
            lockboxSpendingRate: { type: Type.NUMBER, description: "Annual spending/payout rate (0.0 to 1.0)" },
            lockboxAnnualPayout: { type: Type.NUMBER, description: "Total annual payout to operations in billions" }
          },
          required: [
            "institutionName", "year", "fy", "fiscalYearEnd", "published", "auditOpinion",
            "totalRevenue", "totalExpenses", "netPosition", "totalAssets",
            "totalLiabilities", "totalNetAssets", "totalDebt", "endowment", "privateGiftsOperating",
            "revenueBySource", "expenseByFunction", "lockboxEndowmentTotal", "lockboxPermanentlyRestricted",
            "lockboxBoardDesignated", "lockboxSpendingRate", "lockboxAnnualPayout"
          ]
        }
      }
    });

    const extractedJson = response.text;
    const data = JSON.parse(extractedJson || "{}");

    const draft = await prisma.draftReport.create({
      data: {
        fileName: file.name,
        status: "PENDING",
        extractedData: JSON.stringify(data),
        // Stored as a data URL so the review page can serve it back later — no
        // separate blob storage wired up yet, so this rides in Postgres for now.
        fileUrl: `data:${file.type || "application/pdf"};base64,${base64Data}`,
      },
    });

    return NextResponse.json({
      success: true,
      data,
      draftId: draft.id,
    });

  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
