import type { Metadata } from "next";
import { prisma } from "@/prisma";
import { PortalInstitutionReportsView } from "./PortalInstitutionReportsView";

export async function generateMetadata({ params }: { params: Promise<{ institution: string }> }): Promise<Metadata> {
  const { institution: slug } = await params;
  const institution = await prisma.institution.findUnique({ where: { slug }, select: { name: true } });
  if (!institution) return { title: "Institution not found | Pass Impact" };
  return { title: `${institution.name} — Reports | Pass Impact Portal` };
}

export default async function PortalInstitutionReportsPage({ params }: { params: Promise<{ institution: string }> }) {
  const { institution: slug } = await params;
  return <PortalInstitutionReportsView slug={slug} />;
}
