import React from "react";

export type BadgeVariant = "brand" | "success" | "warning" | "danger" | "info" | "neutral";
export type BookingStatusType = "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: BookingStatusType;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-900",
  success: "bg-success-50 text-success-700 border-success-200 dark:bg-success-950/60 dark:text-success-300 dark:border-success-900",
  warning: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950/60 dark:text-warning-300 dark:border-warning-900",
  danger: "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950/60 dark:text-danger-300 dark:border-danger-900",
  info: "bg-info-50 text-info-700 border-info-200 dark:bg-info-950/60 dark:text-info-300 dark:border-info-900",
  neutral: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const statusVariantMap: Record<BookingStatusType, BadgeVariant> = {
  CONFIRMED: "success",
  CANCELLED: "danger",
  PENDING: "warning",
  COMPLETED: "info",
};

export function Badge({
  variant,
  status,
  size = "md",
  children,
  className = "",
  ...props
}: BadgeProps) {
  // If status prop is passed (e.g. CONFIRMED, CANCELLED), resolve the variant automatically
  const activeVariant = variant || (status ? statusVariantMap[status] : "neutral");
  const label = children || status;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${variantStyles[activeVariant]} ${className}`}
      {...props}
    >
      {label}
    </span>
  );
}
