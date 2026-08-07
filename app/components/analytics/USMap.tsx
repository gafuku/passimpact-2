"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { StateAggregate } from "@/app/lib/analytics";
import { parseStateFromLocation } from "@/app/lib/usStates";
import { EmptyChartState } from "./shared";

const GEO_URL = "/maps/us-states-10m.json";

type Metric = "institutionCount" | "totalAssets" | "totalEndowment" | "totalRevenue";

const METRICS: { key: Metric; label: string; unit: "" | "B" }[] = [
  { key: "institutionCount", label: "Institutions", unit: "" },
  { key: "totalAssets", label: "Total assets", unit: "B" },
  { key: "totalEndowment", label: "Total endowment", unit: "B" },
  { key: "totalRevenue", label: "Total revenue", unit: "B" },
];

function interpolateBlue(t: number) {
  // t in [0,1] -> light-to-brand blue, matching the app's categorical blue (#2a78d6).
  const start = { r: 224, g: 234, b: 247 };
  const end = { r: 21, g: 74, b: 138 };
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function USInstitutionsMap({ states }: { states: StateAggregate[] }) {
  const [metric, setMetric] = useState<Metric>("institutionCount");
  const [hovered, setHovered] = useState<StateAggregate | null>(null);

  const byStateName = useMemo(() => new Map(states.map((s) => [s.state, s])), [states]);
  const max = useMemo(() => Math.max(1, ...states.map((s) => s[metric])), [states, metric]);
  const activeMetric = METRICS.find((m) => m.key === metric)!;

  if (states.length === 0) {
    return <EmptyChartState message="Institution locations will appear here once reports are published with a recognizable US state." />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              metric === m.key ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <ComposableMap projection="geoAlbersUsa" width={880} height={500} style={{ width: "100%", height: "auto" }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const state = byStateName.get(geo.properties.name as string);
                const value = state ? state[metric] : 0;
                const fill = state ? interpolateBlue(Math.max(0.15, value / max)) : "#f3f2ef";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHovered(state ?? null)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default: { fill, stroke: "#faf9f7", strokeWidth: 0.75, outline: "none" },
                      hover: { fill: state ? "#eda100" : "#e3e2de", stroke: "#faf9f7", strokeWidth: 0.75, outline: "none" },
                      pressed: { fill: "#eda100", stroke: "#faf9f7", strokeWidth: 0.75, outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        <div className="pointer-events-none absolute left-2 top-2 rounded border border-border bg-white/95 px-3 py-2 text-xs min-w-40">
          {hovered ? (
            <>
              <p className="font-semibold text-text">
                {hovered.state} ({hovered.abbr})
              </p>
              <p className="text-text-muted mt-1">
                {activeMetric.label}: {activeMetric.unit === "B" ? `$${hovered[metric].toFixed(2)}B` : hovered[metric]}
              </p>
              <p className="text-text-faint mt-1 truncate max-w-48">{hovered.institutionNames.join(", ")}</p>
            </>
          ) : (
            <p className="text-text-faint italic">Hover a state for detail</p>
          )}
        </div>
      </div>
    </div>
  );
}

// A single institution's own location — just this one state highlighted, no metric
// toggle or comparison needed. Falls back to a plain note when the location string
// doesn't resolve to a recognizable US state (parseStateFromLocation returns null).
export function InstitutionLocationMap({ location }: { location: string }) {
  const stateInfo = useMemo(() => parseStateFromLocation(location), [location]);

  if (!stateInfo) {
    return <EmptyChartState message={`Couldn't place "${location}" on the map yet.`} />;
  }

  return (
    <ComposableMap projection="geoAlbersUsa" width={880} height={460} style={{ width: "100%", height: "auto" }}>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const isHome = geo.properties.name === stateInfo.name;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: isHome ? "#2a78d6" : "#f3f2ef",
                    stroke: "#faf9f7",
                    strokeWidth: 0.75,
                    outline: "none",
                  },
                  hover: { fill: isHome ? "#2a78d6" : "#f3f2ef", stroke: "#faf9f7", strokeWidth: 0.75, outline: "none" },
                  pressed: { fill: isHome ? "#2a78d6" : "#f3f2ef", stroke: "#faf9f7", strokeWidth: 0.75, outline: "none" },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
