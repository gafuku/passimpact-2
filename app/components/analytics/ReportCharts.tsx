"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { LineItem, Report } from "@/app/components/report/reportData";
import { CATEGORICAL, colorAt, tooltipContentStyle, EmptyChartState } from "./shared";

function MixDonut({ title, items, total }: { title: string; items: LineItem[]; total: number }) {
  if (items.length === 0) return <EmptyChartState message="No line-item breakdown published for this report." />;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <div>
      <p className="text-xs font-semibold text-text mb-1">{title}</p>
      <p className="text-xs text-text-faint mb-3">${total.toFixed(2)}B total</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={sorted} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={1.5}>
            {sorted.map((item, i) => (
              <Cell key={item.label} fill={colorAt(i)} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle()} formatter={(value, name) => [`$${Number(value).toFixed(2)}B`, String(name)]} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 space-y-1.5">
        {sorted.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorAt(i) }} />
            <span className="truncate flex-1">{item.label}</span>
            <span className="tabular-nums text-text font-medium">{((item.value / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RevenueExpenseDonuts({ report }: { report: Report }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <MixDonut title="Where the money came from" items={report.revenueBySource} total={report.totalRevenue} />
      <MixDonut title="Where the money went" items={report.expenseByFunction} total={report.totalExpenses} />
    </div>
  );
}

export function BalanceSheetBarChart({ report }: { report: Report }) {
  const data = [
    { label: "Total assets", value: report.totalAssets },
    { label: "Total liabilities", value: report.totalLiabilities },
    { label: "Net assets", value: report.totalNetAssets },
    { label: "Total debt", value: report.totalDebt },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}B`} contentStyle={tooltipContentStyle()} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={colorAt(i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EndowmentAllocationDonut({ report }: { report: Report }) {
  const { lockbox } = report;
  const restricted = lockbox.endowmentTotal * lockbox.permanentlyRestricted;
  const designated = lockbox.endowmentTotal * lockbox.boardDesignated;
  const remainder = Math.max(0, lockbox.endowmentTotal - restricted - designated);

  const data = [
    { label: "Permanently restricted", value: restricted },
    { label: "Board designated", value: designated },
    ...(remainder > 0.005 ? [{ label: "Unrestricted / other", value: remainder }] : []),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={1.5}>
            {data.map((d, i) => (
              <Cell key={d.label} fill={[CATEGORICAL[4], CATEGORICAL[0], CATEGORICAL[3]][i]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle()} formatter={(value, name) => [`$${Number(value).toFixed(2)}B`, String(name)]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-text-muted">Total endowment</p>
          <p className="mt-1 text-lg font-semibold text-text tabular-nums">${lockbox.endowmentTotal.toFixed(2)}B</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Annual spending rate</p>
          <p className="mt-1 text-sm font-semibold text-text tabular-nums">{(lockbox.spendingRate * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Annual payout to operations</p>
          <p className="mt-1 text-sm font-semibold text-text tabular-nums">${lockbox.annualPayout.toFixed(2)}B</p>
        </div>
      </div>
    </div>
  );
}
