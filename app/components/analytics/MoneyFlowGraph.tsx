"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Handle, Position, MarkerType, type Node, type Edge, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Report } from "@/app/components/report/reportData";
import { CATEGORICAL } from "./shared";

const REVENUE_COLOR = CATEGORICAL[0];
const EXPENSE_COLOR = CATEGORICAL[3];
const RADIUS = 300;
const HUB_WIDTH = 172;
const HUB_HEIGHT = 96;
const MIN_WIDTH = 112;
const MAX_WIDTH = 172;
const MIN_HEIGHT = 50;
const MAX_HEIGHT = 78;

// A single invisible handle pinned to dead-center of the node, used for both
// source and target — edges then run node-center to node-center like true
// hub-and-spoke lines instead of snapping to a side of the box.
function CenterHandles() {
  const centered = { opacity: 0, top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;
  return (
    <>
      <Handle type="target" position={Position.Top} style={centered} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={centered} isConnectable={false} />
    </>
  );
}

function HubNode({ data }: NodeProps<Node<{ label: string; sub: string }>>) {
  return (
    <div
      style={{ width: HUB_WIDTH, height: HUB_HEIGHT }}
      className="rounded-xl bg-[#1a1a19] text-white flex flex-col items-center justify-center text-center shadow-lg border-4 border-white px-3"
    >
      <CenterHandles />
      <span className="text-xs font-semibold leading-tight">{data.label}</span>
      <span className="text-[10px] text-white/70 mt-1">{data.sub}</span>
    </div>
  );
}

function CategoryNode({ data }: NodeProps<Node<{ label: string; value: number; color: string; width: number; height: number }>>) {
  return (
    <div
      style={{ width: data.width, height: data.height, backgroundColor: data.color }}
      className="group relative rounded-lg flex flex-col items-center justify-center text-center text-white shadow-md px-2"
    >
      <CenterHandles />
      <span className="text-[10px] font-medium leading-tight line-clamp-2">{data.label}</span>
      <span className="text-[10px] font-semibold mt-0.5 tabular-nums">${data.value.toFixed(2)}B</span>

      {/* Node width is generous but a few category names are still long enough to clip —
          the full label + exact value is always one hover away. */}
      <div className="pointer-events-none absolute -top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-[#1a1a19] px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {data.label} · ${data.value.toFixed(2)}B
      </div>
    </div>
  );
}

const nodeTypes = { hub: HubNode, category: CategoryNode };

function angleFor(index: number, count: number, fromDeg: number, toDeg: number) {
  if (count <= 1) return (fromDeg + toDeg) / 2;
  return fromDeg + ((toDeg - fromDeg) * index) / (count - 1);
}

function radialPoint(angleDeg: number, width: number, height: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: RADIUS * Math.cos(rad) - width / 2, y: RADIUS * Math.sin(rad) - height / 2 };
}

export function MoneyFlowGraph({ report, institutionName }: { report: Report; institutionName: string }) {
  const { nodes, edges } = useMemo(() => {
    const revenue = [...report.revenueBySource].sort((a, b) => b.value - a.value);
    const expenses = [...report.expenseByFunction].sort((a, b) => b.value - a.value);
    const maxValue = Math.max(...revenue.map((r) => r.value), ...expenses.map((e) => e.value), 0.001);
    const sizeFor = (v: number) => {
      const t = v / maxValue;
      return { width: MIN_WIDTH + t * (MAX_WIDTH - MIN_WIDTH), height: MIN_HEIGHT + t * (MAX_HEIGHT - MIN_HEIGHT) };
    };
    const edgeWidthFor = (v: number) => 1.5 + (v / maxValue) * 5;

    const nodes: Node[] = [
      {
        id: "hub",
        type: "hub",
        position: { x: -HUB_WIDTH / 2, y: -HUB_HEIGHT / 2 },
        data: { label: institutionName, sub: `$${report.totalRevenue.toFixed(1)}B budget` },
        draggable: true,
      },
      ...revenue.map((r, i) => {
        const { width, height } = sizeFor(r.value);
        const angle = angleFor(i, revenue.length, 110, 250);
        return {
          id: `rev-${i}`,
          type: "category",
          position: radialPoint(angle, width, height),
          data: { label: r.label, value: r.value, color: REVENUE_COLOR, width, height },
        };
      }),
      ...expenses.map((e, i) => {
        const { width, height } = sizeFor(e.value);
        const angle = angleFor(i, expenses.length, -70, 70);
        return {
          id: `exp-${i}`,
          type: "category",
          position: radialPoint(angle, width, height),
          data: { label: e.label, value: e.value, color: EXPENSE_COLOR, width, height },
        };
      }),
    ];

    const edges: Edge[] = [
      ...revenue.map((r, i) => ({
        id: `e-rev-${i}`,
        source: `rev-${i}`,
        target: "hub",
        type: "straight" as const,
        animated: true,
        style: { stroke: REVENUE_COLOR, strokeWidth: edgeWidthFor(r.value), strokeDasharray: "5 5" },
        markerEnd: { type: MarkerType.ArrowClosed, color: REVENUE_COLOR, width: 16, height: 16 },
      })),
      ...expenses.map((e, i) => ({
        id: `e-exp-${i}`,
        source: "hub",
        target: `exp-${i}`,
        type: "straight" as const,
        animated: true,
        style: { stroke: EXPENSE_COLOR, strokeWidth: edgeWidthFor(e.value), strokeDasharray: "5 5" },
        markerEnd: { type: MarkerType.ArrowClosed, color: EXPENSE_COLOR, width: 16, height: 16 },
      })),
    ];

    return { nodes, edges };
  }, [report, institutionName]);

  if (report.revenueBySource.length === 0 && report.expenseByFunction.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded border border-dashed border-border">
        <p className="text-xs text-text-faint italic px-6 text-center">
          Money flow appears once revenue or expense line items are on file.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REVENUE_COLOR }} /> Flowing in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} /> Flowing out
        </span>
        <span className="text-text-faint">Drag a node, scroll to zoom, hover for detail</span>
      </div>
      <div style={{ height: 600 }} className="rounded border border-border overflow-hidden bg-surface">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesConnectable={false}
          nodesDraggable
          elementsSelectable={false}
          panOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} color="#e3e2de" />
        </ReactFlow>
      </div>
    </div>
  );
}
