import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeInstitution, serializeReport } from "../serialize";

export async function GET() {
  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    include: {
      namedFunds: true,
      reports: {
        orderBy: { year: "desc" },
        take: 1,
        include: { lineItems: true },
      },
    },
  });

  const data = institutions.map((institution) => {
    const [latestReport] = institution.reports;
    return {
      ...serializeInstitution(institution),
      latest: latestReport ? serializeReport(latestReport, institution.slug) : null,
    };
  });

  return NextResponse.json({ institutions: data });
}
