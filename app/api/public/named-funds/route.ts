import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeNamedFund } from "../serialize";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET() {
  try {
    const funds = await withDbRetry(() =>
      prisma.namedFund.findMany({
        orderBy: { name: "asc" },
        include: { institution: { select: { slug: true } } },
      })
    );

    const data = funds.map((fund) => serializeNamedFund(fund, fund.institution.slug));

    return NextResponse.json({ namedFunds: data });
  } catch (error) {
    return apiError(error, "GET /api/public/named-funds");
  }
}
