import { CardSkeleton } from "@/components/ui/Skeleton";

export default function OwnerLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
