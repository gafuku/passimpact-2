"use client";

import Link from "next/link";
import { ReportOverview } from "@/app/components/report/ReportOverview";
import { YearLens } from "@/app/components/report/YearLens";
import { Explorer } from "@/app/components/report/Explorer";
import { Lockbox } from "@/app/components/report/Lockbox";
import { ReportChatLauncher } from "@/app/components/portal/ReportChatLauncher";
import { useInstitutionReports } from "@/app/hooks/useInstitutionReports";
import { Skeleton, KpiRowSkeleton } from "@/app/components/Skeleton";
import { ChartCard } from "@/app/components/analytics/shared";
import { RevenueExpenseDonuts, BalanceSheetBarChart, EndowmentAllocationDonut } from "@/app/components/analytics/ReportCharts";
import { MoneyFlowGraph } from "@/app/components/analytics/MoneyFlowGraph";
import { InstitutionLocationMap } from "@/app/components/analytics/USMap";

export function PortalReportDetailView({ slug, year }: { slug: string; year: number }) {
  const { institution, reports, loading, error } = useInstitutionReports(slug);

  if (loading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-3 w-56 mb-8" />
        <div className="border-b border-border pb-8 mb-8">
          <Skeleton className="h-4 w-72 mb-3" />
          <Skeleton className="h-3 w-96" />
        </div>
        <KpiRowSkeleton count={4} />
      </div>
    );
  }

  const report = reports.find((r) => r.year === year);

  if (error || !institution || !report) {
    return <p className="text-xs text-[#d03b3b]">{error ? `Couldn't load this report: ${error}` : "Report not found."}</p>;
  }

  const chronological = [...reports].sort((a, b) => a.year - b.year);
  const idx = chronological.findIndex((r) => r.year === report.year);
  const previousReport = idx > 0 ? chronological[idx - 1] : undefined;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/portal/institutions" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
            ← My Institutions
          </Link>
          <span className="text-text-faint text-xs">/</span>
          <Link href={`/portal/reports/${slug}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
            {institution.name} reports
          </Link>
        </div>
        <ReportChatLauncher institution={institution} report={report} previousReport={previousReport} />
      </div>

      {reports.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {reports.map((r) => (
            <Link
              key={r.year}
              href={`/portal/reports/${slug}/${r.year}`}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                r.year === report.year ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
              }`}
            >
              {r.fy}
            </Link>
          ))}
        </div>
      )}

      <ReportOverview institution={institution} report={report} previousReport={previousReport} />

      <div className="mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Visualized</span>
        <h2 className="mt-2 text-lg font-sans text-text">This report, charted</h2>
        <div className="mt-6 flex flex-col gap-6">
          <ChartCard
            title="Where the money flows"
            subtitle={`${institution.shortName} at the center — money flowing in from revenue sources and out to expense categories in ${report.fy}.`}
          >
            <MoneyFlowGraph report={report} institutionName={institution.shortName} />
          </ChartCard>
          <ChartCard title="Revenue & expense mix" subtitle={`${report.fy} operating activity, broken down.`}>
            <RevenueExpenseDonuts report={report} />
          </ChartCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Balance sheet snapshot" subtitle="Assets, liabilities, net assets, and debt.">
              <BalanceSheetBarChart report={report} />
            </ChartCard>
            <ChartCard title="Endowment allocation" subtitle="How the endowment is restricted, and what it pays out.">
              <EndowmentAllocationDonut report={report} />
            </ChartCard>
          </div>
          <ChartCard title="Where this institution is located" subtitle={institution.location}>
            <InstitutionLocationMap location={institution.location} />
          </ChartCard>
        </div>
      </div>

      <YearLens reports={reports} />
      <Explorer reports={reports} />
      <Lockbox report={report} />
    </div>
  );
}
