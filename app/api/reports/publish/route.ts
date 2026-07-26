import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || "institution";
  let slug = root;
  let i = 1;
  while (await prisma.institution.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${root}-${i}`;
  }
  return slug;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const {
      draftId,
      institutionMode,
      institutionId,
      newInstitution,
      revenueBySource = [],
      expenseByFunction = [],
      ...report
    } = data;

    let resolvedInstitutionId: string;
    let institutionName: string;

    if (institutionMode === "new") {
      if (!newInstitution?.name) {
        return NextResponse.json({ error: "New institution name is required" }, { status: 400 });
      }
      const slug = await uniqueSlug(newInstitution.name);
      const created = await prisma.institution.create({
        data: {
          slug,
          name: newInstitution.name,
          shortName: newInstitution.shortName || newInstitution.name,
          type: newInstitution.type || "Unknown",
          location: newInstitution.location || "Unknown",
        },
      });
      resolvedInstitutionId = created.id;
      institutionName = created.name;
    } else {
      if (!institutionId) {
        return NextResponse.json({ error: "An institution must be selected or created" }, { status: 400 });
      }
      const existing = await prisma.institution.findUnique({ where: { id: institutionId } });
      if (!existing) {
        return NextResponse.json({ error: "Selected institution was not found" }, { status: 400 });
      }
      resolvedInstitutionId = existing.id;
      institutionName = existing.name;
    }

    const lineItems = [
      ...revenueBySource.map((r: { label: string; value: number }) => ({ type: "REVENUE", label: r.label, value: r.value })),
      ...expenseByFunction.map((e: { label: string; value: number }) => ({ type: "EXPENSE", label: e.label, value: e.value })),
    ];

    const createdReport = await prisma.report.create({
      data: {
        institutionId: resolvedInstitutionId,
        year: report.year,
        fy: report.fy,
        fiscalYearEnd: report.fiscalYearEnd,
        published: report.published,
        auditOpinion: report.auditOpinion,
        totalRevenue: report.totalRevenue,
        totalExpenses: report.totalExpenses,
        netPosition: report.netPosition,
        totalAssets: report.totalAssets,
        totalLiabilities: report.totalLiabilities,
        totalNetAssets: report.totalNetAssets,
        totalDebt: report.totalDebt,
        endowment: report.endowment,
        privateGiftsOperating: report.privateGiftsOperating,
        lockboxEndowmentTotal: report.lockboxEndowmentTotal,
        lockboxPermanentlyRestricted: report.lockboxPermanentlyRestricted,
        lockboxBoardDesignated: report.lockboxBoardDesignated,
        lockboxSpendingRate: report.lockboxSpendingRate,
        lockboxAnnualPayout: report.lockboxAnnualPayout,
        lineItems: { create: lineItems },
      },
      include: { institution: true },
    });

    if (draftId) {
      await prisma.draftReport.update({ where: { id: draftId }, data: { status: "PUBLISHED" } }).catch(() => {
        // draft may not exist (e.g. manual publish without a draft) — not fatal
      });
    }

    return NextResponse.json({
      success: true,
      report: { id: createdReport.id, year: createdReport.year, fy: createdReport.fy },
      institution: { id: createdReport.institution.id, slug: createdReport.institution.slug, name: institutionName },
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A report for this institution and fiscal year already exists." }, { status: 409 });
    }
    console.error("Publish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
