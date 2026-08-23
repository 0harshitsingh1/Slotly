import { Spinner } from "./Spinner";

interface LoadingStateProps {
  label?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  label = "Loading content...",
  description,
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center space-y-3 rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
        <Spinner size="md" />
      </div>
      <div className="space-y-1">
        <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
          {label}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
