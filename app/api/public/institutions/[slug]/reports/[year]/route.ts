import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeInstitution, serializeReport } from "@/app/api/public/serialize";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; year: string }> }) {
  const { slug, year } = await params;
  const yearNum = Number(year);

  const institution = await prisma.institution.findUnique({
    where: { slug },
    include: { reports: { orderBy: { year: "asc" }, include: { lineItems: true } } },
  });

  if (!institution) {
    return NextResponse.json({ error: "Institution not found" }, { status: 404 });
  }

  const chronological = institution.reports;
  const idx = chronological.findIndex((r) => r.year === yearNum);
  if (idx === -1) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const report = chronological[idx];
  const previousReport = idx > 0 ? chronological[idx - 1] : null;

  return NextResponse.json({
    institution: serializeInstitution(institution),
    report: serializeReport(report, institution.slug),
    previousReport: previousReport ? serializeReport(previousReport, institution.slug) : null,
  });
}
