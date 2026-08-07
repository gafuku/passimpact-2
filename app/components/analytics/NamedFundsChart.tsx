"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { colorAt, tooltipContentStyle, EmptyChartState } from "./shared";

export function NamedFundsChart({ funds }: { funds: { type: string; count: number; totalMarketValue: number }[] }) {
  if (funds.length === 0) {
    return <EmptyChartState message="No named funds have been published yet — they'll show up here by restriction type once added." />;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={funds} margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip
          contentStyle={tooltipContentStyle()}
          formatter={(value, name) => (name === "count" ? [value, "Funds"] : [`$${Number(value).toFixed(1)}M`, "Market value"])}
        />
        <Bar dataKey="count" name="count" radius={[3, 3, 0, 0]}>
          {funds.map((f, i) => (
            <Cell key={f.type} fill={colorAt(i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
