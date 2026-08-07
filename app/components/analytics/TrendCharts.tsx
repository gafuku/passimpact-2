"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TrendSeries } from "@/app/lib/analytics";
import { CATEGORICAL, colorAt, tooltipContentStyle, EmptyChartState } from "./shared";

type Metric = "totalRevenue" | "totalExpenses" | "endowment" | "totalAssets";

// Recharts wants one row per x-value with each series as its own key, but our data
// is naturally "one series (institution) with its own list of {year, value} points" —
// years don't line up across institutions. Re-shape into { year, [institutionName]: value } rows.
function toWideFormat(trends: TrendSeries[], metric: Metric) {
  const years = Array.from(new Set(trends.flatMap((t) => t.points.map((p) => p.year)))).sort((a, b) => a - b);
  return years.map((year) => {
    const row: Record<string, number | string> = { year };
    for (const t of trends) {
      const point = t.points.find((p) => p.year === year);
      if (point) row[t.shortName] = point[metric];
    }
    return row;
  });
}

export function MultiInstitutionTrendChart({ trends, metric, unit = "B" }: { trends: TrendSeries[]; metric: Metric; unit?: string }) {
  if (trends.length === 0) {
    return <EmptyChartState message="Trends appear once an institution has reports for two or more fiscal years." />;
  }
  const data = toWideFormat(trends, metric);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}${unit}`} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}${unit}`} contentStyle={tooltipContentStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {trends.map((t, i) => (
          <Line
            key={t.name}
            type="monotone"
            dataKey={t.shortName}
            stroke={colorAt(i)}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// A single institution's own revenue-vs-expenses history, one bar pair per fiscal
// year — distinct from MultiInstitutionTrendChart, which compares institutions to
// each other rather than a school to its own past.
export function InstitutionRevenueExpenseByYearChart({ points }: { points: TrendSeries["points"] }) {
  if (points.length < 2) {
    return <EmptyChartState message="Trends appear once this institution has reports for two or more fiscal years." />;
  }
  const data = [...points].sort((a, b) => a.year - b.year).map((p) => ({ fy: p.fy, revenue: p.totalRevenue, expenses: p.totalExpenses }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="fy" tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}B`} contentStyle={tooltipContentStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="revenue" name="Revenue" fill={CATEGORICAL[0]} radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill={CATEGORICAL[3]} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InstitutionEndowmentTrendChart({ points }: { points: TrendSeries["points"] }) {
  if (points.length < 2) {
    return <EmptyChartState message="Trends appear once this institution has reports for two or more fiscal years." />;
  }
  const data = [...points].sort((a, b) => a.year - b.year).map((p) => ({ fy: p.fy, endowment: p.endowment, totalAssets: p.totalAssets }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="fy" tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}B`} contentStyle={tooltipContentStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="endowment" name="Endowment" stroke={CATEGORICAL[4]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="totalAssets" name="Total assets" stroke={CATEGORICAL[0]} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
