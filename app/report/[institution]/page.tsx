import type { Metadata } from "next";
import { prisma } from "@/prisma";
import { InstitutionReportsView } from "./InstitutionReportsView";

export async function generateMetadata({ params }: { params: Promise<{ institution: string }> }): Promise<Metadata> {
  const { institution: slug } = await params;
  const institution = await prisma.institution.findUnique({ where: { slug }, select: { name: true } });
  if (!institution) return { title: "Institution not found | Pass Impact" };
  return {
    title: `${institution.name} — Reports on file | Pass Impact`,
    description: `Every audited financial report Pass Impact has on the file for ${institution.name}, most recent first.`,
  };
}

export default async function InstitutionReportsPage({ params }: { params: Promise<{ institution: string }> }) {
  const { institution: slug } = await params;
  return <InstitutionReportsView slug={slug} />;
}
