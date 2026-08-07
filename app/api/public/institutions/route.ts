import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeInstitution, serializeReport } from "../serialize";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET() {
  try {
    const institutions = await withDbRetry(() =>
      prisma.institution.findMany({
        orderBy: { name: "asc" },
        include: {
          namedFunds: true,
          reports: {
            orderBy: { year: "desc" },
            take: 1,
            include: { lineItems: true },
          },
        },
      })
    );

    const data = institutions.map((institution) => {
      const [latestReport] = institution.reports;
      return {
        ...serializeInstitution(institution),
        latest: latestReport ? serializeReport(latestReport, institution.slug) : null,
      };
    });

    return NextResponse.json({ institutions: data });
  } catch (error) {
    return apiError(error, "GET /api/public/institutions");
  }
}
