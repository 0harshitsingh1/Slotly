import { CardSkeleton } from "@/components/ui/Skeleton";

export default function BusinessesLoading() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-28 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
