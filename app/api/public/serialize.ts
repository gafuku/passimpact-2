import type { Institution as PrismaInstitution, Report as PrismaReport, LineItem, NamedFund as PrismaNamedFund } from "@prisma/client";

// Shapes match app/components/report/reportData.ts's Institution/Report/NamedFund types
// exactly, so donor-facing components can move from the mock catalog to these live
// endpoints without needing their own prop shapes to change.

export function serializeInstitution(institution: PrismaInstitution & { namedFunds?: PrismaNamedFund[] }) {
  return {
    slug: institution.slug,
    name: institution.name,
    shortName: institution.shortName,
    type: institution.type,
    location: institution.location,
    namedFundsAvailable: institution.namedFunds?.map((f) => f.name) ?? [],
  };
}

export function serializeNamedFund(fund: PrismaNamedFund, institutionSlug: string) {
  return {
    id: fund.id,
    name: fund.name,
    institutionSlug,
    purpose: fund.purpose,
    restrictionType: fund.restrictionType as "Scholarship" | "Fellowship" | "Research" | "Capital",
    marketValue: fund.marketValue,
    spendingRate: fund.spendingRate,
    established: fund.established,
  };
}

export function serializeReport(report: PrismaReport & { lineItems: LineItem[] }, institutionSlug: string) {
  return {
    id: report.id,
    institutionSlug,
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
    revenueBySource: report.lineItems.filter((l) => l.type === "REVENUE").map((l) => ({ label: l.label, value: l.value })),
    expenseByFunction: report.lineItems.filter((l) => l.type === "EXPENSE").map((l) => ({ label: l.label, value: l.value })),
    lockbox: {
      endowmentTotal: report.lockboxEndowmentTotal,
      permanentlyRestricted: report.lockboxPermanentlyRestricted,
      boardDesignated: report.lockboxBoardDesignated,
      spendingRate: report.lockboxSpendingRate,
      annualPayout: report.lockboxAnnualPayout,
    },
  };
}
