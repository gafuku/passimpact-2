import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeInstitution, serializeReport } from "@/app/api/public/serialize";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const institution = await prisma.institution.findUnique({
    where: { slug },
    include: {
      namedFunds: true,
      reports: { orderBy: { year: "desc" }, include: { lineItems: true } },
    },
  });

  if (!institution) {
    return NextResponse.json({ error: "Institution not found" }, { status: 404 });
  }

  return NextResponse.json({
    institution: serializeInstitution(institution),
    reports: institution.reports.map((r) => serializeReport(r, institution.slug)),
  });
}
