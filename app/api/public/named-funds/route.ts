import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { serializeNamedFund } from "../serialize";

export async function GET() {
  const funds = await prisma.namedFund.findMany({
    orderBy: { name: "asc" },
    include: { institution: { select: { slug: true } } },
  });

  const data = funds.map((fund) => serializeNamedFund(fund, fund.institution.slug));

  return NextResponse.json({ namedFunds: data });
}
