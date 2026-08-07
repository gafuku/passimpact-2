"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { InstitutionMix } from "@/app/lib/analytics";
import { colorAt, tooltipContentStyle, EmptyChartState } from "./shared";

export function InstitutionMixGrid({ mixes, valueLabel }: { mixes: InstitutionMix[]; valueLabel: string }) {
  if (mixes.length === 0) return <EmptyChartState message="No line-item breakdown published yet." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {mixes.map((mix) => (
        <div key={mix.name} className="border border-border p-4">
          <p className="text-xs font-semibold text-text mb-1">{mix.shortName}</p>
          <p className="text-xs text-text-faint mb-2">
            {valueLabel}: ${mix.total.toFixed(2)}B
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={mix.items} dataKey="value" nameKey="label" innerRadius={40} outerRadius={68} paddingAngle={1}>
                {mix.items.map((item, i) => (
                  <Cell key={item.label} fill={colorAt(i)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle()}
                formatter={(value, name) => [`$${Number(value).toFixed(2)}B`, String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
            {mix.items
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((item) => (
                <li key={item.label} className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colorAt(mix.items.indexOf(item)) }} />
                  <span className="truncate flex-1">{item.label}</span>
                  <span className="tabular-nums text-text-faint">{((item.value / mix.total) * 100).toFixed(0)}%</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
