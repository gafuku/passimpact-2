import { prisma } from "@/prisma";
import { parseStateFromLocation } from "./usStates";

export { parseStateFromLocation };

export type InstitutionSummary = {
  name: string;
  shortName: string;
  slug: string;
  type: string;
  location: string;
  state: string | null;
  stateAbbr: string | null;
  latestYear: number;
  totalRevenue: number;
  totalExpenses: number;
  netPosition: number;
  totalAssets: number;
  totalLiabilities: number;
  totalNetAssets: number;
  totalDebt: number;
  endowment: number;
  auditOpinion: string;
};

export type TrendSeries = {
  name: string;
  shortName: string;
  slug: string;
  points: {
    year: number;
    fy: string;
    totalRevenue: number;
    totalExpenses: number;
    netPosition: number;
    totalAssets: number;
    endowment: number;
  }[];
};

export type StateAggregate = {
  state: string;
  abbr: string;
  institutionCount: number;
  totalAssets: number;
  totalEndowment: number;
  totalRevenue: number;
  institutionNames: string[];
};

export type InstitutionMix = {
  name: string;
  shortName: string;
  slug: string;
  total: number;
  items: { label: string; value: number }[];
};

export type PublicAnalytics = {
  totals: {
    institutionCount: number;
    reportCount: number;
    stateCount: number;
    totalAssets: number;
    totalRevenue: number;
    totalExpenses: number;
    totalEndowment: number;
    totalLiabilities: number;
    totalDebt: number;
  };
  institutions: InstitutionSummary[];
  trends: TrendSeries[];
  states: StateAggregate[];
  revenueMixByInstitution: InstitutionMix[];
  expenseMixByInstitution: InstitutionMix[];
  auditOpinions: { label: string; count: number }[];
  namedFundsByType: { type: string; count: number; totalMarketValue: number }[];
};

// Two admin uploads for the same school with slightly different name casing/
// punctuation create separate Institution rows (the publish flow only matches
// on exact id, not fuzzy name). Grouping by lowercased name here keeps totals
// from double-counting a school and lets multi-year trends line up under one
// series even when the years landed under different institution ids.
export async function getPublicAnalytics(): Promise<PublicAnalytics> {
  const institutions = await prisma.institution.findMany({
    include: {
      reports: { include: { lineItems: true }, orderBy: { year: "asc" } },
      namedFunds: true,
    },
  });

  const byName = new Map<string, typeof institutions>();
  for (const inst of institutions) {
    const key = inst.name.trim().toLowerCase();
    const list = byName.get(key) ?? [];
    list.push(inst);
    byName.set(key, list);
  }

  const institutionSummaries: InstitutionSummary[] = [];
  const trends: TrendSeries[] = [];
  const revenueMixByInstitution: InstitutionMix[] = [];
  const expenseMixByInstitution: InstitutionMix[] = [];
  const stateMap = new Map<string, StateAggregate>();
  const auditOpinionCounts = new Map<string, number>();

  for (const group of byName.values()) {
    const first = group[0];
    const allReports = group
      .flatMap((inst) => inst.reports.map((r) => ({ ...r, _slug: inst.slug })))
      .sort((a, b) => a.year - b.year);
    if (allReports.length === 0) continue;
    const latest = allReports[allReports.length - 1];
    const stateInfo = parseStateFromLocation(first.location);

    institutionSummaries.push({
      name: first.name,
      shortName: first.shortName,
      slug: latest._slug,
      type: first.type,
      location: first.location,
      state: stateInfo?.name ?? null,
      stateAbbr: stateInfo?.abbr ?? null,
      latestYear: latest.year,
      totalRevenue: latest.totalRevenue,
      totalExpenses: latest.totalExpenses,
      netPosition: latest.netPosition,
      totalAssets: latest.totalAssets,
      totalLiabilities: latest.totalLiabilities,
      totalNetAssets: latest.totalNetAssets,
      totalDebt: latest.totalDebt,
      endowment: latest.endowment,
      auditOpinion: latest.auditOpinion,
    });

    auditOpinionCounts.set(latest.auditOpinion, (auditOpinionCounts.get(latest.auditOpinion) ?? 0) + 1);

    if (allReports.length >= 2) {
      trends.push({
        name: first.name,
        shortName: first.shortName,
        slug: latest._slug,
        points: allReports.map((r) => ({
          year: r.year,
          fy: r.fy,
          totalRevenue: r.totalRevenue,
          totalExpenses: r.totalExpenses,
          netPosition: r.netPosition,
          totalAssets: r.totalAssets,
          endowment: r.endowment,
        })),
      });
    }

    const revenueItems = latest.lineItems.filter((l) => l.type === "REVENUE").map((l) => ({ label: l.label, value: l.value }));
    const expenseItems = latest.lineItems.filter((l) => l.type === "EXPENSE").map((l) => ({ label: l.label, value: l.value }));
    if (revenueItems.length) {
      revenueMixByInstitution.push({ name: first.name, shortName: first.shortName, slug: latest._slug, total: latest.totalRevenue, items: revenueItems });
    }
    if (expenseItems.length) {
      expenseMixByInstitution.push({ name: first.name, shortName: first.shortName, slug: latest._slug, total: latest.totalExpenses, items: expenseItems });
    }

    if (stateInfo) {
      const existing = stateMap.get(stateInfo.name) ?? {
        state: stateInfo.name,
        abbr: stateInfo.abbr,
        institutionCount: 0,
        totalAssets: 0,
        totalEndowment: 0,
        totalRevenue: 0,
        institutionNames: [],
      };
      existing.institutionCount += 1;
      existing.totalAssets += latest.totalAssets;
      existing.totalEndowment += latest.endowment;
      existing.totalRevenue += latest.totalRevenue;
      existing.institutionNames.push(first.name);
      stateMap.set(stateInfo.name, existing);
    }
  }

  const fundsByType = new Map<string, { count: number; totalMarketValue: number }>();
  for (const fund of institutions.flatMap((i) => i.namedFunds)) {
    const existing = fundsByType.get(fund.restrictionType) ?? { count: 0, totalMarketValue: 0 };
    existing.count += 1;
    existing.totalMarketValue += fund.marketValue;
    fundsByType.set(fund.restrictionType, existing);
  }

  const totals = institutionSummaries.reduce(
    (acc, i) => {
      acc.totalAssets += i.totalAssets;
      acc.totalRevenue += i.totalRevenue;
      acc.totalExpenses += i.totalExpenses;
      acc.totalEndowment += i.endowment;
      acc.totalLiabilities += i.totalLiabilities;
      acc.totalDebt += i.totalDebt;
      return acc;
    },
    { totalAssets: 0, totalRevenue: 0, totalExpenses: 0, totalEndowment: 0, totalLiabilities: 0, totalDebt: 0 }
  );

  return {
    totals: {
      institutionCount: institutionSummaries.length,
      reportCount: institutions.reduce((sum, i) => sum + i.reports.length, 0),
      stateCount: stateMap.size,
      ...totals,
    },
    institutions: institutionSummaries.sort((a, b) => b.totalAssets - a.totalAssets),
    trends,
    states: Array.from(stateMap.values()),
    revenueMixByInstitution,
    expenseMixByInstitution,
    auditOpinions: Array.from(auditOpinionCounts.entries()).map(([label, count]) => ({ label, count })),
    namedFundsByType: Array.from(fundsByType.entries()).map(([type, v]) => ({ type, ...v })),
  };
}

export type DonorActivity = {
  totalSessions: number;
  totalMessages: number;
  activityByDay: { date: string; messages: number }[];
  institutionsExplored: { name: string; shortName: string; slug: string; sessions: number; messages: number }[];
};

export async function getDonorActivity(userId: string): Promise<DonorActivity> {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    include: { report: { include: { institution: true } }, messages: true },
  });

  const totalMessages = sessions.reduce((sum, s) => sum + s.messages.filter((m) => m.role === "user").length, 0);

  const dayMap = new Map<string, number>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of sessions) {
    for (const m of s.messages) {
      if (m.role !== "user") continue;
      const key = m.createdAt.toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }

  const instMap = new Map<string, { name: string; shortName: string; slug: string; sessions: number; messages: number }>();
  for (const s of sessions) {
    const key = s.report.institution.id;
    const existing = instMap.get(key) ?? {
      name: s.report.institution.name,
      shortName: s.report.institution.shortName,
      slug: s.report.institution.slug,
      sessions: 0,
      messages: 0,
    };
    existing.sessions += 1;
    existing.messages += s.messages.filter((m) => m.role === "user").length;
    instMap.set(key, existing);
  }

  return {
    totalSessions: sessions.length,
    totalMessages,
    activityByDay: Array.from(dayMap.entries()).map(([date, messages]) => ({ date, messages })),
    institutionsExplored: Array.from(instMap.values()).sort((a, b) => b.messages - a.messages),
  };
}
