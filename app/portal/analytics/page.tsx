"use client";

import { usePortalAnalytics } from "@/app/hooks/usePortalAnalytics";
import { KpiRow, RevenueExpenseBarChart, AssetsBubbleChart, AuditOpinionDonut } from "@/app/components/analytics/OverviewCharts";
import { MultiInstitutionTrendChart } from "@/app/components/analytics/TrendCharts";
import { InstitutionMixGrid } from "@/app/components/analytics/MixCharts";
import { USInstitutionsMap } from "@/app/components/analytics/USMap";
import { NamedFundsChart } from "@/app/components/analytics/NamedFundsChart";
import { DonorActivityChart, InstitutionsExploredChart } from "@/app/components/analytics/DonorActivityCharts";
import { ChartCard } from "@/app/components/analytics/shared";
import { KpiRowSkeleton, ChartCardSkeleton } from "@/app/components/Skeleton";

export default function PortalAnalyticsPage() {
  const { analytics, loading, error } = usePortalAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
        <KpiRowSkeleton />
        <ChartCardSkeleton height={400} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </div>
    );
  }
  if (error) return <p className="text-xs text-[#d03b3b]">Couldn&apos;t load analytics: {error}</p>;
  if (!analytics) return null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Analytics</span>
        <h1 className="mt-2 text-lg font-sans text-text">Your giving intelligence dashboard</h1>
        <p className="mt-2 text-xs text-text-muted max-w-2xl">
          A personalized view of your activity plus aggregate trends across every institution on Pass Impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Your chat activity" subtitle="Messages you've sent to report assistants over the last 30 days.">
          <DonorActivityChart activity={analytics.activity} />
        </ChartCard>
        <ChartCard title="Institutions you've explored" subtitle="Ranked by how many messages you've sent about each.">
          <InstitutionsExploredChart activity={analytics.activity} />
        </ChartCard>
      </div>

      <KpiRow
        institutionCount={analytics.totals.institutionCount}
        reportCount={analytics.totals.reportCount}
        stateCount={analytics.totals.stateCount}
        totalAssets={analytics.totals.totalAssets}
        totalRevenue={analytics.totals.totalRevenue}
        totalEndowment={analytics.totals.totalEndowment}
      />

      <ChartCard title="Where institutions are located" subtitle="Color intensity reflects the selected metric. Hover a state for detail.">
        <USInstitutionsMap states={analytics.states} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue vs. expenses" subtitle="Latest fiscal year on file per institution.">
          <RevenueExpenseBarChart institutions={analytics.institutions} />
        </ChartCard>
        <ChartCard title="Assets, revenue & endowment" subtitle="Bubble size represents endowment size.">
          <AssetsBubbleChart institutions={analytics.institutions} />
        </ChartCard>
      </div>

      <ChartCard title="Multi-year revenue trend" subtitle="Institutions with two or more fiscal years on file.">
        <MultiInstitutionTrendChart trends={analytics.trends} metric="totalRevenue" />
      </ChartCard>

      <ChartCard title="Endowment growth" subtitle="Endowment market value by fiscal year.">
        <MultiInstitutionTrendChart trends={analytics.trends} metric="endowment" />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Named funds by restriction type" subtitle="Across all institutions.">
            <NamedFundsChart funds={analytics.namedFundsByType} />
          </ChartCard>
        </div>
        <ChartCard title="Audit opinions" subtitle="Latest report per institution.">
          <AuditOpinionDonut opinions={analytics.auditOpinions} />
        </ChartCard>
      </div>

      <ChartCard title="Revenue mix by institution" subtitle="How each institution's operating revenue breaks down.">
        <InstitutionMixGrid mixes={analytics.revenueMixByInstitution} valueLabel="Total revenue" />
      </ChartCard>

      <ChartCard title="Expense mix by institution" subtitle="How each institution's operating expenses break down.">
        <InstitutionMixGrid mixes={analytics.expenseMixByInstitution} valueLabel="Total expenses" />
      </ChartCard>
    </div>
  );
}
