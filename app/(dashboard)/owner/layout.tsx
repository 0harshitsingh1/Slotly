import React from "react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-hidden">
      {/* Operational / Business Owner Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[700px] rounded-full bg-brand-500/10 blur-[140px] dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-slate-400/10 blur-[140px] dark:bg-indigo-950/20" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
