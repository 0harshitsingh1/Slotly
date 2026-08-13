import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import CancelBookingButton from "./CancelBookingButton";

export const metadata = {
  title: "Bookings — Owner Dashboard",
};

function formatSlotTime(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
          CONFIRMED
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          PENDING
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
          CANCELLED
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          COMPLETED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {status}
        </span>
      );
  }
}

export default async function OwnerBookingsPage() {
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
            Please register your business before managing bookings.
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

  const rawBookings = await db.booking.findMany({
    where: { business_id: business.id },
    include: {
      customer: {
        select: { name: true, email: true },
      },
      service: {
        select: { name: true, duration_minutes: true, price: true },
      },
    },
    orderBy: { start_at: "asc" },
  });

  const now = new Date();

  // Requirements: Sort upcoming bookings first
  const upcomingBookings = rawBookings
    .filter((b) => b.end_at >= now)
    .sort((a, b) => a.start_at.getTime() - b.start_at.getTime()); // Soonest upcoming first

  const pastBookings = rawBookings
    .filter((b) => b.end_at < now)
    .sort((a, b) => b.start_at.getTime() - a.start_at.getTime()); // Most recent past first

  // Helper to group array of bookings by Date
  const groupBookingsByDate = (bookingsList: typeof rawBookings) => {
    const map = new Map<string, { label: string; items: typeof rawBookings }>();

    for (const booking of bookingsList) {
      const dateKey = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: business.timezone,
      }).format(booking.start_at);

      const label = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: business.timezone,
      }).format(booking.start_at);

      if (!map.has(dateKey)) {
        map.set(dateKey, { label, items: [] });
      }
      map.get(dateKey)!.items.push(booking);
    }

    return Array.from(map.entries());
  };

  const upcomingGrouped = groupBookingsByDate(upcomingBookings);
  const pastGrouped = groupBookingsByDate(pastBookings);

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/owner"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Owner Dashboard
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Manage Bookings
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

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Total Bookings
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {rawBookings.length}
            </dd>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/40">
            <dt className="text-xs font-medium uppercase text-blue-600 dark:text-blue-400">
              Upcoming
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {upcomingBookings.length}
            </dd>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 shadow-sm dark:border-green-900/50 dark:bg-green-950/40">
            <dt className="text-xs font-medium uppercase text-green-600 dark:text-green-400">
              Confirmed
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-green-700 dark:text-green-300">
              {rawBookings.filter((b) => b.status === "CONFIRMED").length}
            </dd>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/40">
            <dt className="text-xs font-medium uppercase text-red-600 dark:text-red-400">
              Cancelled
            </dt>
            <dd className="mt-1 text-2xl font-extrabold text-red-700 dark:text-red-300">
              {rawBookings.filter((b) => b.status === "CANCELLED").length}
            </dd>
          </div>
        </div>

        {/* Section 1: Upcoming Bookings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📅 Upcoming Bookings</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {upcomingBookings.length}
              </span>
            </h2>
          </div>

          {upcomingGrouped.length > 0 ? (
            upcomingGrouped.map(([dateKey, group]) => (
              <div
                key={dateKey}
                className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 pb-2 dark:border-gray-800">
                  {group.label}
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {group.items.map((booking) => {
                    const startTime = formatSlotTime(booking.start_at, business.timezone);
                    const endTime = formatSlotTime(booking.end_at, business.timezone);
                    const isCancelled = booking.status === "CANCELLED";

                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                              {booking.service.name}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Customer:{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {booking.customer.name || booking.customer.email}
                            </span>{" "}
                            ({booking.customer.email})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Time: <span className="font-medium text-blue-600 dark:text-blue-400">{startTime} - {endTime}</span> • Price: ${booking.service.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <CancelBookingButton
                            bookingId={booking.id}
                            isCancelled={isCancelled}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming bookings scheduled.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Past Bookings */}
        {pastGrouped.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>🕒 Past Bookings</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {pastBookings.length}
                </span>
              </h2>
            </div>

            {pastGrouped.map(([dateKey, group]) => (
              <div
                key={dateKey}
                className="space-y-3 rounded-xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 opacity-90"
              >
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 pb-2 dark:border-gray-800">
                  {group.label}
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {group.items.map((booking) => {
                    const startTime = formatSlotTime(booking.start_at, business.timezone);
                    const endTime = formatSlotTime(booking.end_at, business.timezone);
                    const isCancelled = booking.status === "CANCELLED";

                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                              {booking.service.name}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Customer: {booking.customer.name || booking.customer.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Time: {startTime} - {endTime}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <CancelBookingButton
                            bookingId={booking.id}
                            isCancelled={isCancelled}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
