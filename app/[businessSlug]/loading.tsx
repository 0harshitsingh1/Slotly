import { SlotGridSkeleton } from "@/components/ui/Skeleton";

export default function BusinessPageLoading() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-40 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950 animate-pulse" />
        <div className="space-y-4">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <SlotGridSkeleton />
        </div>
      </div>
    </div>
  );
}
