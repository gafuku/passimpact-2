import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeInstitution, serializeReport } from "@/app/api/public/serialize";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const institution = await withDbRetry(() =>
      prisma.institution.findUnique({
        where: { slug },
        include: {
          namedFunds: true,
          reports: { orderBy: { year: "desc" }, include: { lineItems: true } },
        },
      })
    );

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    return NextResponse.json({
      institution: serializeInstitution(institution),
      reports: institution.reports.map((r) => serializeReport(r, institution.slug)),
    });
  } catch (error) {
    return apiError(error, "GET /api/public/institutions/[slug]");
  }
}
