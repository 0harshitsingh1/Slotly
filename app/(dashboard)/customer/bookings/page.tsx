import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { CustomerBookingsList, SerializedCustomerBooking } from "./CustomerBookingsList";

export const metadata = {
  title: "My Appointments — Customer Dashboard",
  description: "View and manage your upcoming, past, and cancelled reservations.",
};

export default async function CustomerBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
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

  const serializedBookings: SerializedCustomerBooking[] = rawBookings.map((b) => ({
    id: b.id,
    status: b.status,
    start_at: b.start_at.toISOString(),
    end_at: b.end_at.toISOString(),
    business: {
      name: b.business.name,
      slug: b.business.slug,
      timezone: b.business.timezone,
    },
    service: {
      name: b.service.name,
      duration_minutes: b.service.duration_minutes,
      price: b.service.price,
    },
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <Link
              href="/customer"
              className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              ← Customer Dashboard
            </Link>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View details, cancel active slots, or review past service reservations.
            </p>
          </div>

          <Link href="/businesses">
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
              + Book New Appointment
            </button>
          </Link>
        </div>

        {/* Filterable Bookings List */}
        <CustomerBookingsList bookings={serializedBookings} />
      </div>
    </div>
  );
}
