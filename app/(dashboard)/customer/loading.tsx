import { CardSkeleton } from "@/components/ui/Skeleton";

export default function CustomerLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
