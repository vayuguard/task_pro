import type { Key } from 'react';

export function Skeleton({ className = '', key: _key }: { className?: string; key?: Key }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden />;
}

export function PageLoading() {
  return (
    <div className="flex flex-col gap-5" aria-live="polite" aria-busy>
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}
