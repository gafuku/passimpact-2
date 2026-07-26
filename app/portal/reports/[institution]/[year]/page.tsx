import type { Metadata } from "next";
import { prisma } from "@/prisma";
import { PortalReportDetailView } from "./PortalReportDetailView";

export async function generateMetadata({ params }: { params: Promise<{ institution: string; year: string }> }): Promise<Metadata> {
  const { institution: slug, year } = await params;
  const institution = await prisma.institution.findUnique({ where: { slug }, select: { name: true } });
  if (!institution) return { title: "Report not found | Pass Impact" };
  return { title: `${institution.name} FY${year} Report | Pass Impact Portal` };
}

export default async function PortalReportDetailPage({ params }: { params: Promise<{ institution: string; year: string }> }) {
  const { institution: slug, year } = await params;
  return <PortalReportDetailView slug={slug} year={Number(year)} />;
}
