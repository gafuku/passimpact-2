import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError } from "@/app/lib/apiError";
import { withDbRetry } from "@/app/lib/withDbRetry";

const lineItemSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
});

const newInstitutionSchema = z.object({
  name: z.string().min(1, "Institution name is required"),
  shortName: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
});

const publishSchema = z
  .object({
    draftId: z.string().optional(),
    institutionMode: z.enum(["existing", "new"]),
    institutionId: z.string().optional(),
    newInstitution: newInstitutionSchema.optional(),

    year: z.number().int(),
    fy: z.string().min(1),
    fiscalYearEnd: z.string().min(1),
    published: z.string().min(1),
    auditOpinion: z.string().min(1),

    totalRevenue: z.number(),
    totalExpenses: z.number(),
    netPosition: z.number(),
    privateGiftsOperating: z.number(),

    totalAssets: z.number(),
    totalLiabilities: z.number(),
    totalNetAssets: z.number(),
    totalDebt: z.number(),

    endowment: z.number(),
    lockboxEndowmentTotal: z.number(),
    lockboxPermanentlyRestricted: z.number(),
    lockboxBoardDesignated: z.number(),
    lockboxSpendingRate: z.number(),
    lockboxAnnualPayout: z.number(),

    revenueBySource: z.array(lineItemSchema).default([]),
    expenseByFunction: z.array(lineItemSchema).default([]),
  })
  .refine((data) => data.institutionMode !== "existing" || !!data.institutionId, {
    message: "Select an institution",
    path: ["institutionId"],
  })
  .refine((data) => data.institutionMode !== "new" || !!data.newInstitution?.name, {
    message: "New institution name is required",
    path: ["newInstitution", "name"],
  });

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string) {
  const root = slugify(base) || "institution";
  let slug = root;
  let i = 1;
  while (await withDbRetry(() => prisma.institution.findUnique({ where: { slug } }))) {
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
    const parsed = publishSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    const { draftId, institutionMode, institutionId, newInstitution, revenueBySource, expenseByFunction, ...report } =
      parsed.data;

    let resolvedInstitutionId: string;
    let institutionName: string;

    if (institutionMode === "new") {
      // Admins re-uploading a report for a school they've already published under
      // "new" (rather than picking "existing") used to create a second Institution
      // row with the same name — same school split across two unrelated pages with
      // no shared year-over-year history. Matching by normalized name here means a
      // repeat name always lands on the same institution regardless of which mode
      // the form was left on.
      const match = await withDbRetry(() =>
        prisma.institution.findFirst({ where: { name: { equals: newInstitution!.name.trim(), mode: "insensitive" } } })
      );

      if (match) {
        resolvedInstitutionId = match.id;
        institutionName = match.name;
      } else {
        const slug = await uniqueSlug(newInstitution!.name);
        const created = await withDbRetry(() =>
          prisma.institution.create({
            data: {
              slug,
              name: newInstitution!.name,
              shortName: newInstitution!.shortName || newInstitution!.name,
              type: newInstitution!.type || "Unknown",
              location: newInstitution!.location || "Unknown",
            },
          })
        );
        resolvedInstitutionId = created.id;
        institutionName = created.name;
      }
    } else {
      const existing = await withDbRetry(() => prisma.institution.findUnique({ where: { id: institutionId } }));
      if (!existing) {
        return NextResponse.json({ error: "Selected institution was not found" }, { status: 400 });
      }
      resolvedInstitutionId = existing.id;
      institutionName = existing.name;
    }

    const lineItems = [
      ...revenueBySource.map((r) => ({ type: "REVENUE", label: r.label, value: r.value })),
      ...expenseByFunction.map((e) => ({ type: "EXPENSE", label: e.label, value: e.value })),
    ];

    const createdReport = await withDbRetry(() =>
      prisma.report.create({
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
      })
    );

    if (draftId) {
      await withDbRetry(() => prisma.draftReport.update({ where: { id: draftId }, data: { status: "PUBLISHED" } })).catch(
        () => {
          // draft may not exist (e.g. manual publish without a draft) — not fatal
        }
      );
    }

    return NextResponse.json({
      success: true,
      report: { id: createdReport.id, year: createdReport.year, fy: createdReport.fy },
      institution: { id: createdReport.institution.id, slug: createdReport.institution.slug, name: institutionName },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A report for this institution and fiscal year already exists." }, { status: 409 });
    }
    return apiError(error, "POST /api/reports/publish");
  }
}
