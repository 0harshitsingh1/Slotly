import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <main className="w-full max-w-xl space-y-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to Slotly
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Appointment scheduling and slot management platform.
          </p>
        </div>

        {session?.user ? (
          <div className="space-y-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/40">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Logged in as <span className="font-semibold">{session.user.email}</span> ({session.user.role})
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {session.user.role === "OWNER" ? (
                <Link
                  href="/owner"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Go to Owner Dashboard
                </Link>
              ) : (
                <Link
                  href="/customer"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Go to Customer Dashboard
                </Link>
              )}
              <Link
                href="/businesses"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Browse Businesses ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/businesses"
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Browse Businesses
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Log In
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
