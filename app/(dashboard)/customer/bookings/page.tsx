import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import CancelCustomerBookingButton from "./CancelCustomerBookingButton";

export const metadata = {
  title: "My Bookings — Customer Dashboard",
};

function formatBookingDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: timezone,
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

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

export default async function CustomerBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const rawBookings = await db.booking.findMany({
    where: { customer_id: session.user.id },
    include: {
      business: {
        select: { name: true, slug: true, timezone: true },
      },
      service: {
        select: { name: true, duration_minutes: true, price: true },
      },
    },
    orderBy: { start_at: "asc" },
  });

  const now = new Date();

  // Separate into upcoming and past sections
  const upcomingBookings = rawBookings
    .filter((b) => b.end_at >= now)
    .sort((a, b) => a.start_at.getTime() - b.start_at.getTime()); // Soonest first

  const pastBookings = rawBookings
    .filter((b) => b.end_at < now)
    .sort((a, b) => b.start_at.getTime() - a.start_at.getTime()); // Most recent past first

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <Link
              href="/customer"
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Customer Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Appointments
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your upcoming and past reservations.
            </p>
          </div>
        </div>

        {/* Section 1: Upcoming Bookings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📅 Upcoming Appointments</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {upcomingBookings.length}
              </span>
            </h2>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {upcomingBookings.map((booking) => {
                const dateStr = formatBookingDate(booking.start_at, booking.business.timezone);
                const startTime = formatSlotTime(booking.start_at, booking.business.timezone);
                const endTime = formatSlotTime(booking.end_at, booking.business.timezone);

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/${booking.business.slug}`}
                          className="text-base font-bold text-gray-900 hover:text-blue-600 hover:underline dark:text-gray-100 dark:hover:text-blue-400"
                        >
                          {booking.business.name}
                        </Link>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {booking.service.name} ({booking.service.duration_minutes} min)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{dateStr}</span> • {startTime} - {endTime} ({booking.business.timezone})
                      </p>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Price: ${booking.service.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="self-start sm:self-center">
                      <CancelCustomerBookingButton
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have no upcoming appointments scheduled.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Past Bookings */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>🕒 Past Appointments</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {pastBookings.length}
              </span>
            </h2>
          </div>

          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pastBookings.map((booking) => {
                const dateStr = formatBookingDate(booking.start_at, booking.business.timezone);
                const startTime = formatSlotTime(booking.start_at, booking.business.timezone);
                const endTime = formatSlotTime(booking.end_at, booking.business.timezone);

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white/70 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 opacity-80 gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/${booking.business.slug}`}
                          className="text-base font-semibold text-gray-900 hover:underline dark:text-gray-100"
                        >
                          {booking.business.name}
                        </Link>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {booking.service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dateStr} • {startTime} - {endTime}
                      </p>
                    </div>

                    <div className="self-start sm:self-center">
                      <CancelCustomerBookingButton
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No past appointments found.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
