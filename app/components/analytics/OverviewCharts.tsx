"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell,
} from "recharts";
import type { InstitutionSummary } from "@/app/lib/analytics";
import { CATEGORICAL, colorAt, formatBillions, tooltipContentStyle, ChartCard, EmptyChartState } from "./shared";

export function KpiRow({
  institutionCount,
  reportCount,
  stateCount,
  totalAssets,
  totalRevenue,
  totalEndowment,
}: {
  institutionCount: number;
  reportCount: number;
  stateCount: number;
  totalAssets: number;
  totalRevenue: number;
  totalEndowment: number;
}) {
  const tiles = [
    { label: "Institutions tracked", value: String(institutionCount) },
    { label: "Reports on file", value: String(reportCount) },
    { label: "States represented", value: String(stateCount) },
    { label: "Combined assets", value: formatBillions(totalAssets) },
    { label: "Combined revenue", value: formatBillions(totalRevenue) },
    { label: "Combined endowment", value: formatBillions(totalEndowment) },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-l border-border">
      {tiles.map((t) => (
        <div key={t.label} className="border-r border-b border-border p-5 md:p-6 bg-surface">
          <p className="text-xs text-text-muted">{t.label}</p>
          <p className="mt-2 text-lg font-semibold text-text tabular-nums">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

export function RevenueExpenseBarChart({ institutions }: { institutions: InstitutionSummary[] }) {
  if (institutions.length === 0) return <EmptyChartState message="No published reports yet." />;
  const data = institutions.map((i) => ({ name: i.shortName, revenue: i.totalRevenue, expenses: i.totalExpenses }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#1a1a19" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip formatter={(v) => formatBillions(Number(v))} contentStyle={tooltipContentStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="revenue" name="Revenue" fill={CATEGORICAL[0]} radius={[0, 3, 3, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill={CATEGORICAL[3]} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AssetsBubbleChart({ institutions }: { institutions: InstitutionSummary[] }) {
  if (institutions.length === 0) return <EmptyChartState message="No published reports yet." />;
  const data = institutions.map((i, idx) => ({
    name: i.shortName,
    totalAssets: i.totalAssets,
    totalRevenue: i.totalRevenue,
    endowment: i.endowment,
    fill: colorAt(idx),
  }));
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          type="number"
          dataKey="totalAssets"
          name="Total assets"
          unit="B"
          tick={{ fontSize: 11, fill: "#6b6a66" }}
          axisLine={{ stroke: "#e3e2de" }}
          tickLine={false}
          label={{ value: "Total assets ($B)", position: "insideBottom", offset: -6, fontSize: 11, fill: "#6b6a66" }}
        />
        <YAxis
          type="number"
          dataKey="totalRevenue"
          name="Total revenue"
          unit="B"
          tick={{ fontSize: 11, fill: "#6b6a66" }}
          axisLine={{ stroke: "#e3e2de" }}
          tickLine={false}
          label={{ value: "Total revenue ($B)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#6b6a66" }}
        />
        <ZAxis type="number" dataKey="endowment" range={[80, 900]} name="Endowment" unit="B" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={tooltipContentStyle()}
          formatter={(value, name) => [`$${Number(value).toFixed(2)}B`, String(name)]}
          labelFormatter={() => ""}
        />
        <Scatter data={data} fillOpacity={0.75}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} stroke={d.fill} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function AuditOpinionDonut({ opinions }: { opinions: { label: string; count: number }[] }) {
  if (opinions.length === 0) return <EmptyChartState message="No reports to summarize yet." />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={opinions} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {opinions.map((o, i) => (
            <Cell key={o.label} fill={colorAt(i)} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipContentStyle()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { ChartCard, EmptyChartState };
