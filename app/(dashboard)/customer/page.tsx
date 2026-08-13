import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";

export const metadata = {
  title: "Customer Dashboard — Slotly",
};

export default async function CustomerDashboardPage() {
  const session = await auth();

  const userBookings = session?.user?.id
    ? await db.booking.findMany({
        where: { customer_id: session.user.id },
        select: { id: true, status: true, start_at: true, end_at: true },
      })
    : [];

  const now = new Date();
  const upcomingCount = userBookings.filter((b) => b.end_at >= now).length;
  const confirmedCount = userBookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Customer Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your upcoming and past bookings.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Quick Nav Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  My Appointments
                </h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  {upcomingCount} Upcoming
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Check details for your scheduled services or cancel active reservations.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/customer/bookings"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View My Bookings →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Book a New Appointment
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Browse available local service providers and reserve your next slot.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Explore Services →
              </Link>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Account Details
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User ID
              </dt>
              <dd className="mt-1 text-sm font-mono font-medium text-gray-900 dark:text-gray-100 truncate">
                {session?.user?.id || "N/A"}
              </dd>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {session?.user?.email || "N/A"}
              </dd>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Bookings
              </dt>
              <dd className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {userBookings.length} total ({confirmedCount} confirmed)
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
