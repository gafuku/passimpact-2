import type { Metadata } from "next";
import { prisma } from "@/prisma";
import { ReportDetailView } from "./ReportDetailView";

export async function generateMetadata({ params }: { params: Promise<{ institution: string; year: string }> }): Promise<Metadata> {
  const { institution: slug, year } = await params;
  const institution = await prisma.institution.findUnique({ where: { slug }, select: { name: true } });
  if (!institution) return { title: "Report not found | Pass Impact" };
  return {
    title: `${institution.name} FY${year} Report | Pass Impact`,
    description: `A guest-viewable, source-cited breakdown of ${institution.name}'s FY${year} audited financial report — cash flow, year-over-year trends, and endowment literacy.`,
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ institution: string; year: string }> }) {
  const { institution: slug, year } = await params;
  return <ReportDetailView slug={slug} year={Number(year)} />;
}
