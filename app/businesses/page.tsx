import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import BusinessDirectoryClient from "./BusinessDirectoryClient";

export const metadata = {
  title: "Explore Businesses — Slotly Directory",
  description: "Browse local service providers, search by services, and find appointments near you.",
};

export default async function BusinessesDirectoryPage() {
  const session = await auth();

  if (session?.user?.role === "OWNER") {
    redirect("/owner?error=owner_booking_disabled");
  }

  const businesses = await db.business.findMany({
    include: {
      images: {
        orderBy: { created_at: "asc" },
      },
      services: {
        select: {
          id: true,
          name: true,
          duration_minutes: true,
          price: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Consumer-Facing Ambient Mesh Glow Background (Stitch Design) */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-brand-500/10 blur-[140px] animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] animate-glow-float-alt" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <header className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.12)] backdrop-blur-xl space-y-2">
          <div>
            <Link
              href="/"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1 mb-2"
            >
              <span>←</span> Back to Home
            </Link>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
              Discover Services
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Find and book appointments with top-rated local service providers in real time.
            </p>
          </div>
        </header>

        {/* Directory Search & List */}
        <BusinessDirectoryClient initialBusinesses={businesses} />
      </div>
    </div>
  );
}
