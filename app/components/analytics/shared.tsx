"use client";

// Extends the report page's fixed 5-color categorical palette (app/components/report/ReportOverview.tsx)
// with more slots so charts with more series (e.g. one line per institution) don't repeat colors too soon.
export const CATEGORICAL = [
  "#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a",
  "#8355d1", "#d0433f", "#0d9aa6", "#c67c1e", "#5b6bd6",
];

export function colorAt(i: number) {
  return CATEGORICAL[i % CATEGORICAL.length];
}

export function formatBillions(value: number | undefined | null) {
  return typeof value === "number" ? `$${value.toFixed(2)}B` : "—";
}

export function formatCompact(value: number | undefined | null) {
  if (typeof value !== "number") return "—";
  return `$${value.toFixed(1)}B`;
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-sans text-text">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-text-muted max-w-md">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded border border-dashed border-border">
      <p className="text-xs text-text-faint italic px-6 text-center">{message}</p>
    </div>
  );
}

export function tooltipContentStyle() {
  return {
    background: "white",
    border: "1px solid var(--color-border, #e5e5e5)",
    borderRadius: 4,
    fontSize: 11,
    padding: "8px 10px",
  } as const;
}
