"use client";

import { useMemo, useState } from "react";
import type { Report } from "./reportData";

const METRICS: { key: "totalRevenue" | "privateGiftsOperating" | "totalExpenses"; label: string }[] = [
  { key: "totalRevenue", label: "Total Revenue" },
  { key: "privateGiftsOperating", label: "Private Gifts (Operating)" },
  { key: "totalExpenses", label: "Total Expenses" },
];

export function YearLens({ reports }: { reports: Report[] }) {
  const chronological = [...reports].sort((a, b) => a.year - b.year);
  const years = chronological.map((r) => r.fy);

  const [fromYear, setFromYear] = useState(years[0]);
  const [toYear, setToYear] = useState(years[years.length - 1]);

  const reportFor = (fy: string) => chronological.find((r) => r.fy === fy)!;

  const deltas = useMemo(
    () =>
      METRICS.map(({ key, label }) => {
        const from = reportFor(fromYear)[key];
        const to = reportFor(toYear)[key];
        const pct = ((to - from) / from) * 100;
        return { label, from, to, pct };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromYear, toYear, reports]
  );

  const fastest = useMemo(() => [...deltas].sort((a, b) => b.pct - a.pct)[0], [deltas]);
  const invalidRange = years.indexOf(fromYear) >= years.indexOf(toYear);

  return (
    <div className="border-t border-border pt-16 mb-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">The Year Lens</span>
      <h2 className="mt-2 text-lg font-sans text-text">Pick two years, see what changed</h2>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-2 text-text-muted">
          From
          <select
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
            className="rounded border border-border bg-white px-2 py-1.5 text-text text-xs"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <span className="text-text-faint">→</span>
        <label className="flex items-center gap-2 text-text-muted">
          To
          <select
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            className="rounded border border-border bg-white px-2 py-1.5 text-text text-xs"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      {invalidRange ? (
        <p className="mt-8 text-xs text-text-muted italic">Pick a "from" year earlier than the "to" year to see the comparison.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 border-t border-l border-border">
            {deltas.map((d) => (
              <div key={d.label} className="border-r border-b border-border p-6 bg-surface">
                <p className="text-xs text-text-muted">{d.label}</p>
                <p className="mt-2 text-lg font-semibold text-text">${d.to.toFixed(2)}B</p>
                <p className={`mt-2 text-xs font-medium ${d.pct >= 0 ? "text-[#006300]" : "text-[#d03b3b]"}`}>
                  {d.pct >= 0 ? "▲" : "▼"} {Math.abs(d.pct).toFixed(1)}% since {fromYear}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-text-muted max-w-2xl">
            Between {fromYear} and {toYear}, <span className="text-text font-medium">{fastest.label}</span> was the
            fastest-growing line item, up {fastest.pct.toFixed(1)}% — a signal of where flexible giving is having the most
            visible impact.
          </p>
        </>
      )}
    </div>
  );
}
