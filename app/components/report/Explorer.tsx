"use client";

import { useMemo, useState } from "react";
import type { Report } from "./reportData";

const SEQUENTIAL_HUE = "#2a78d6";
const METRICS: { key: "totalRevenue" | "privateGiftsOperating" | "totalExpenses"; label: string }[] = [
  { key: "totalRevenue", label: "Total Revenue" },
  { key: "privateGiftsOperating", label: "Private Gifts (Operating)" },
  { key: "totalExpenses", label: "Total Expenses" },
];

export function Explorer({ reports }: { reports: Report[] }) {
  const chronological = [...reports].sort((a, b) => a.year - b.year);
  const [metricKey, setMetricKey] = useState(METRICS[0].key);
  const [mode, setMode] = useState<"absolute" | "indexed">("absolute");

  const series = chronological.map((r) => ({ fy: r.fy, value: r[metricKey] }));
  const base = series[0].value;

  const points = useMemo(
    () => series.map((p) => ({ fy: p.fy, display: mode === "absolute" ? p.value : (p.value / base) * 100 })),
    [series, mode, base]
  );
  const max = Math.max(...points.map((p) => p.display));

  return (
    <div className="border-t border-border pt-16 mb-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">The Explorer</span>
      <h2 className="mt-2 text-lg font-sans text-text">Every year on file, your way</h2>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetricKey(m.key)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                metricKey === m.key ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-border p-0.5 text-xs">
          <button
            onClick={() => setMode("absolute")}
            className={`rounded-full px-3 py-1 transition-colors ${mode === "absolute" ? "bg-text text-text-invert" : "text-text-muted"}`}
          >
            Absolute
          </button>
          <button
            onClick={() => setMode("indexed")}
            className={`rounded-full px-3 py-1 transition-colors ${mode === "indexed" ? "bg-text text-text-invert" : "text-text-muted"}`}
          >
            Indexed ({series[0].fy}=100)
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-3 h-48 border-b border-border pb-0">
        {points.map((p, i) => (
          <div key={p.fy} className="flex flex-1 flex-col items-center gap-2">
            {(i === 0 || i === points.length - 1) && (
              <span className="text-xs font-medium text-text tabular-nums">
                {mode === "absolute" ? `$${p.display.toFixed(2)}B` : p.display.toFixed(0)}
              </span>
            )}
            <div
              className="w-10 rounded-t"
              style={{ height: `${(p.display / max) * 160}px`, backgroundColor: SEQUENTIAL_HUE }}
              title={mode === "absolute" ? `${p.fy}: $${p.display.toFixed(2)}B` : `${p.fy}: ${p.display.toFixed(0)} (indexed)`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 mt-2">
        {points.map((p) => (
          <span key={p.fy} className="flex-1 text-center text-[10px] text-text-faint">{p.fy}</span>
        ))}
      </div>
    </div>
  );
}
