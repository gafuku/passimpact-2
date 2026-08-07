export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-surface-raised ${className}`} style={style} />;
}

export function InstitutionCardSkeleton() {
  return (
    <div className="border-r border-b border-border bg-white p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-24 mb-6" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-2.5 w-16 mb-2" />
          <Skeleton className="h-3.5 w-12" />
        </div>
        <div>
          <Skeleton className="h-2.5 w-16 mb-2" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      </div>
      <div className="mt-auto pt-6 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function InstitutionCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
      {Array.from({ length: count }).map((_, i) => (
        <InstitutionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReportRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-border bg-white p-6">
      <div className="flex items-center gap-4 sm:w-40 shrink-0">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-14 mb-2" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KpiRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-t border-l border-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-r border-b border-border p-5 md:p-6 bg-surface">
          <Skeleton className="h-2.5 w-20 mb-3" />
          <Skeleton className="h-4.5 w-16" style={{ height: 18 }} />
        </div>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="border border-border bg-white p-6 md:p-8">
      <Skeleton className="h-3.5 w-40 mb-2" />
      <Skeleton className="h-3 w-64 mb-6" />
      <Skeleton className="w-full" style={{ height }} />
    </div>
  );
}
