import React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-hidden">
      {/* Consumer-Facing / Inviting Sky-Violet Animated Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/15 blur-[140px] dark:bg-sky-500/20 animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-[140px] dark:bg-purple-900/20 animate-glow-float-alt" />

      <div className="relative z-10 animate-page-enter">{children}</div>
    </div>
  );
}
