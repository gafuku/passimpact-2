type StatTileProps = {
  label: string;
  value: string;
  delta?: { text: string; positive: boolean };
  sub?: string;
};

export function StatTile({ label, value, delta, sub }: StatTileProps) {
  return (
    <div className="border-r border-b border-border p-6 md:p-8 bg-surface">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-2 text-lg md:text-lg font-semibold text-text">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span className={`text-xs font-medium ${delta.positive ? "text-[#006300]" : "text-[#d03b3b]"}`}>
            {delta.positive ? "▲" : "▼"} {delta.text}
          </span>
        )}
        {sub && <span className="text-xs text-text-faint">{sub}</span>}
      </div>
    </div>
  );
}
