import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { OwnerBookingsList, SerializedOwnerBooking } from "./OwnerBookingsList";

export const metadata = {
  title: "Bookings",
  description: "View and manage customer appointment reservations.",
};

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
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-slate-950">
        <Card className="mx-auto max-w-xl p-8 text-center border-dashed">
          <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
            No Business Registered
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please register your business before managing client bookings.
          </p>
          <div className="mt-6">
            <Link
              href="/owner/business/new"
              className="inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Create Business Profile
            </Link>
          </div>
        </Card>
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
  const upcomingCount = rawBookings.filter((b) => b.end_at >= now && b.status !== "CANCELLED").length;
  const confirmedCount = rawBookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelledCount = rawBookings.filter((b) => b.status === "CANCELLED").length;

  const serializedBookings: SerializedOwnerBooking[] = rawBookings.map((b) => ({
    id: b.id,
    status: b.status,
    start_at: b.start_at.toISOString(),
    end_at: b.end_at.toISOString(),
    customer: {
      name: b.customer.name,
      email: b.customer.email,
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
              href="/owner"
              className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              ← Owner Dashboard
            </Link>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Manage Bookings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {business.name} • Timezone: <span className="font-medium text-slate-700 dark:text-slate-300">{business.timezone}</span>
            </p>
          </div>

          <Link href={`/${business.slug}`} target="_blank">
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              View Public Page ↗
            </button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Bookings
            </dt>
            <dd className="mt-1 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
              {rawBookings.length}
            </dd>
          </Card>
          <Card className="p-4 border-brand-100 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-950/20">
            <dt className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Upcoming
            </dt>
            <dd className="mt-1 font-heading text-2xl font-extrabold text-brand-700 dark:text-brand-300">
              {upcomingCount}
            </dd>
          </Card>
          <Card className="p-4 border-success-100 bg-success-50/40 dark:border-success-900/50 dark:bg-success-950/20">
            <dt className="text-xs font-semibold uppercase tracking-wider text-success-600 dark:text-success-400">
              Confirmed
            </dt>
            <dd className="mt-1 font-heading text-2xl font-extrabold text-success-700 dark:text-success-300">
              {confirmedCount}
            </dd>
          </Card>
          <Card className="p-4 border-danger-100 bg-danger-50/40 dark:border-danger-900/50 dark:bg-danger-950/20">
            <dt className="text-xs font-semibold uppercase tracking-wider text-danger-600 dark:text-danger-400">
              Cancelled
            </dt>
            <dd className="mt-1 font-heading text-2xl font-extrabold text-danger-700 dark:text-danger-300">
              {cancelledCount}
            </dd>
          </Card>
        </div>

        {/* Filterable Owner Bookings List */}
        <OwnerBookingsList bookings={serializedBookings} timezone={business.timezone} />
      </div>
    </div>
  );
}
