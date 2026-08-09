import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function OwnerDashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Owner Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your business schedules, services, availability, and bookings.
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

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Session Details
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
                Role
              </dt>
              <dd className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {session?.user?.role || "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
