import Link from "next/link";
import { db } from "@/lib/db";
import BusinessDirectoryClient from "./BusinessDirectoryClient";

export const metadata = {
  title: "Explore Businesses — Slotly Directory",
  description: "Browse local service providers, search by services, and find appointments near you.",
};

export default async function BusinessesDirectoryPage() {
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
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8 overflow-hidden">
      {/* Consumer-Facing Ambient Mesh Glow Background */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/10 blur-[140px] dark:bg-sky-500/15" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[140px] dark:bg-purple-900/15" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to Home
            </Link>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Business Directory
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Discover local service providers and book appointments in real time.
            </p>
          </div>
        </header>

        {/* Directory Search & List */}
        <BusinessDirectoryClient initialBusinesses={businesses} />
      </div>
    </div>
  );
}
