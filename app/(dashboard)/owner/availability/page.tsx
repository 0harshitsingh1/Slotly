import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import WeeklyAvailabilityForm from "./WeeklyAvailabilityForm";
import ExceptionForm from "./exceptions/ExceptionForm";
import DeleteExceptionButton from "./exceptions/DeleteExceptionButton";

export const metadata = {
  title: "Availability & Schedule — Owner Dashboard",
};

function formatExceptionDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  } catch {
    return new Date(date).toISOString().split("T")[0];
  }
}

export default async function OwnerAvailabilityPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
  });

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            No Business Registered
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please register your business before configuring availability.
          </p>
          <div className="mt-6">
            <Link
              href="/owner/business/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Create Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Fetch weekly availability
  const availabilities = await db.availability.findMany({
    where: { business_id: business.id },
    select: { day_of_week: true, start_time: true, end_time: true },
    orderBy: { day_of_week: "asc" },
  });

  // 2. Fetch availability exceptions
  const exceptions = await db.availabilityException.findMany({
    where: { business_id: business.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <Link
              href="/owner"
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Owner Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Business Availability & Schedule
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {business.name} • Timezone: {business.timezone}
            </p>
          </div>
          <Link
            href={`/${business.slug}`}
            target="_blank"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 self-start sm:self-auto"
          >
            View Public Booking Page ↗
          </Link>
        </div>

        {/* Section 1: Weekly Recurring Availability Form */}
        <WeeklyAvailabilityForm initialAvailability={availabilities} />

        {/* Section 2: Availability Exceptions Management */}
        <section className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Schedule Exceptions & Holidays
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configure specific dates where your business is fully closed or operates on custom hours.
              </p>
            </div>
          </div>

          <ExceptionForm />

          {/* List of Existing Exceptions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>Active Date Exceptions</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  {exceptions.length}
                </span>
              </h3>
            </div>

            {exceptions.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {exceptions.map((exc) => {
                  const dateFormatted = formatExceptionDate(exc.date);

                  return (
                    <div
                      key={exc.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {dateFormatted}
                        </p>
                        {exc.is_closed ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            FULLY CLOSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            CUSTOM HOURS: {exc.start_time} - {exc.end_time}
                          </span>
                        )}
                      </div>

                      <div className="self-start sm:self-center">
                        <DeleteExceptionButton exceptionId={exc.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No date exceptions configured. Weekly recurring hours apply to all dates.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
