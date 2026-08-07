"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import type { DonorActivity } from "@/app/lib/analytics";
import { CATEGORICAL, colorAt, tooltipContentStyle, EmptyChartState } from "./shared";

export function DonorActivityChart({ activity }: { activity: DonorActivity }) {
  const hasActivity = activity.activityByDay.some((d) => d.messages > 0);
  if (!hasActivity) {
    return <EmptyChartState message="Chat with the AI assistant on a report to start building your activity history." />;
  }
  const data = activity.activityByDay.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 20 }}>
        <defs>
          <linearGradient id="donorActivityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CATEGORICAL[0]} stopOpacity={0.35} />
            <stop offset="95%" stopColor={CATEGORICAL[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} interval={4} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle()} formatter={(v) => [v, "Messages"]} labelFormatter={(l) => `Date: ${l}`} />
        <Area type="monotone" dataKey="messages" stroke={CATEGORICAL[0]} strokeWidth={2} fill="url(#donorActivityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function InstitutionsExploredChart({ activity }: { activity: DonorActivity }) {
  if (activity.institutionsExplored.length === 0) {
    return <EmptyChartState message="Institutions you chat with will show up here." />;
  }
  const data = activity.institutionsExplored.map((i) => ({ name: i.shortName, messages: i.messages }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6b6a66" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#1a1a19" }} axisLine={{ stroke: "#e3e2de" }} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle()} formatter={(v) => [v, "Your messages"]} />
        <Bar dataKey="messages" radius={[0, 3, 3, 0]}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={colorAt(i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
