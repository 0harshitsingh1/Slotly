import React from "react";
import { OwnerSidebar } from "./_components/OwnerSidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 font-sans overflow-hidden">
      {/* Operational / Business Owner Animated Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[700px] rounded-full bg-brand-500/10 blur-[140px] animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-slate-400/10 blur-[140px] animate-glow-float-alt" />

      <div className="relative z-10 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <OwnerSidebar />
        <main className="flex-1 min-w-0 animate-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
