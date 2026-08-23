export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-4 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-1/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function SlotGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60 animate-pulse"
        />
      ))}
    </div>
  );
}
