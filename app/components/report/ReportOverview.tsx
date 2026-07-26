import { StatTile } from "./StatTile";
import type { Institution, Report, LineItem } from "./reportData";

// Categorical slots 1-5 from the validated default palette (fixed order, light mode).
const CATEGORICAL = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a"];

function StackedFlowBar({ rows, total }: { rows: LineItem[]; total: number }) {
  return (
    <div>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded-full bg-surface">
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{ width: `${(row.value / total) * 100}%`, backgroundColor: CATEGORICAL[i % CATEGORICAL.length] }}
            className="h-full"
            title={`${row.label}: $${row.value.toFixed(2)}B`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {rows.map((row, i) => (
          <li key={row.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORICAL[i % CATEGORICAL.length] }} />
            <span className="text-text-muted flex-1">{row.label}</span>
            <span className="font-medium text-text tabular-nums">${row.value.toFixed(2)}B</span>
            <span className="text-text-faint tabular-nums w-12 text-right">{((row.value / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportOverview({ institution, report, previousReport }: { institution: Institution; report: Report; previousReport?: Report }) {
  const revenueGrowth = previousReport ? ((report.totalRevenue - previousReport.totalRevenue) / previousReport.totalRevenue) * 100 : null;

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border pb-8 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0ca30c]/30 bg-[#0ca30c]/10 px-3 py-1 text-[10px] font-mono font-medium tracking-wide text-[#006300]">
            ✓ {report.auditOpinion} Opinion
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
            {report.fy} Sample Report
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
            Guest view — nothing is saved
          </span>
        </div>
        <h1 className="text-lg md:text-lg font-sans font-normal tracking-tight text-text">{institution.name}</h1>
        <p className="mt-2 text-xs text-text-muted">
          {institution.type} · {institution.location} · Fiscal year ended {report.fiscalYearEnd} · Published {report.published}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border mb-12">
        <StatTile
          label="Total revenue"
          value={`$${report.totalRevenue.toFixed(2)}B`}
          delta={revenueGrowth !== null ? { text: `${revenueGrowth.toFixed(1)}% vs ${previousReport!.fy}`, positive: revenueGrowth >= 0 } : undefined}
        />
        <StatTile label="Total expenses" value={`$${report.totalExpenses.toFixed(2)}B`} />
        <StatTile label="Net position change" value={`${report.netPosition >= 0 ? "+" : ""}$${report.netPosition.toFixed(2)}B`} />
        <StatTile label="Endowment" value={`$${report.endowment.toFixed(1)}B`} sub="market value" />
      </div>

      {/* Financial Position */}
      <div className="mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Financial Position</span>
        <h2 className="mt-2 text-lg font-sans text-text">Balance Sheet Snapshot</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
          <StatTile label="Total Assets" value={`$${report.totalAssets.toFixed(2)}B`} />
          <StatTile label="Total Liabilities" value={`$${report.totalLiabilities.toFixed(2)}B`} />
          <StatTile label="Total Net Assets" value={`$${report.totalNetAssets.toFixed(2)}B`} />
          <StatTile label="Total Debt" value={`$${report.totalDebt.toFixed(2)}B`} sub="bonds & notes payable" />
        </div>
      </div>

      {/* Cash Flow Story */}
      <div className="mb-16">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Cash Flow Story</span>
        <h2 className="mt-2 text-lg font-sans text-text">Money in, money out</h2>
        <p className="mt-2 text-xs text-text-muted max-w-2xl">
          {report.fy} revenue and operating expenses, broken down by source and by function.
        </p>

        <div className="mt-8 flex flex-col gap-10">
          <div>
            <p className="text-xs font-semibold text-text mb-3">Money in — ${report.totalRevenue.toFixed(2)}B</p>
            <StackedFlowBar rows={report.revenueBySource} total={report.totalRevenue} />
          </div>
          <div>
            <p className="text-xs font-semibold text-text mb-3">Money out — ${report.totalExpenses.toFixed(2)}B</p>
            <StackedFlowBar rows={report.expenseByFunction} total={report.totalExpenses} />
          </div>
        </div>
      </div>
    </div>
  );
}
