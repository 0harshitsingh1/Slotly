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
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              List Your Business
            </Link>
          </div>
        </header>

        {/* Directory Search & List */}
        <BusinessDirectoryClient initialBusinesses={businesses} />
      </div>
    </div>
  );
}
