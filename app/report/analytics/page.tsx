"use client";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { usePublicAnalytics } from "@/app/hooks/usePublicAnalytics";
import { KpiRow, RevenueExpenseBarChart, AssetsBubbleChart, AuditOpinionDonut } from "@/app/components/analytics/OverviewCharts";
import { MultiInstitutionTrendChart } from "@/app/components/analytics/TrendCharts";
import { InstitutionMixGrid } from "@/app/components/analytics/MixCharts";
import { USInstitutionsMap } from "@/app/components/analytics/USMap";
import { NamedFundsChart } from "@/app/components/analytics/NamedFundsChart";
import { ChartCard } from "@/app/components/analytics/shared";
import { KpiRowSkeleton, ChartCardSkeleton } from "@/app/components/Skeleton";

export default function PublicAnalyticsPage() {
  const { analytics, loading, error } = usePublicAnalytics();

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <section className="bg-surface py-16 md:py-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-inset">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Analytics</span>
            <h1 className="mt-3 text-lg md:text-lg font-sans font-normal tracking-tight text-text max-w-xl">
              Every published report, visualized
            </h1>
            <p className="mt-4 text-text-muted text-lg max-w-2xl">
              Aggregate trends across all institutions on Pass Impact — no sign-in required. Sign in for a personalized
              view of the institutions you've been exploring.
            </p>
          </div>
        </section>

        <section className="bg-surface py-12 flex-1">
          <div className="mx-auto max-w-6xl px-inset flex flex-col gap-10">
            {loading ? (
              <>
                <KpiRowSkeleton />
                <ChartCardSkeleton height={400} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCardSkeleton />
                  <ChartCardSkeleton />
                </div>
                <ChartCardSkeleton />
              </>
            ) : error ? (
              <p className="text-xs text-[#d03b3b]">Couldn&apos;t load analytics: {error}</p>
            ) : !analytics ? null : (
              <>
                <KpiRow
                  institutionCount={analytics.totals.institutionCount}
                  reportCount={analytics.totals.reportCount}
                  stateCount={analytics.totals.stateCount}
                  totalAssets={analytics.totals.totalAssets}
                  totalRevenue={analytics.totals.totalRevenue}
                  totalEndowment={analytics.totals.totalEndowment}
                />

                <ChartCard
                  title="Where institutions are located"
                  subtitle="Color intensity reflects the selected metric. Hover a state for detail."
                >
                  <USInstitutionsMap states={analytics.states} />
                </ChartCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Revenue vs. expenses" subtitle="Latest fiscal year on file per institution.">
                    <RevenueExpenseBarChart institutions={analytics.institutions} />
                  </ChartCard>
                  <ChartCard
                    title="Assets, revenue & endowment"
                    subtitle="Bubble size represents endowment size. Position compares total assets to total revenue."
                  >
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
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
