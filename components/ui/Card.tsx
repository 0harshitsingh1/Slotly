import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 ${
        hoverable
          ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5 hover:border-slate-300 dark:hover:border-slate-700"
          : ""
      } ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-4 space-y-1.5 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 ${className}`}
      {...props}
    />
  );
}
