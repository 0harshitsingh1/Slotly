import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Customer Dashboard — Slotly",
  description: "View and manage your appointment reservations.",
};

function formatDate(date: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || "UTC",
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleString();
  }
}

export default async function CustomerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CUSTOMER") {
    if (session?.user?.role === "OWNER") {
      redirect("/owner");
    }
    redirect("/login");
  }

  const rawBookings = await db.booking.findMany({
    where: { customer_id: session.user.id },
    include: {
      business: {
        select: { name: true, slug: true, timezone: true, address: true },
      },
      service: {
        select: { name: true, duration_minutes: true, price: true },
      },
    },
    orderBy: { start_at: "asc" },
  });

  const now = new Date();
  const totalBookings = rawBookings.length;
  const upcomingBookings = rawBookings.filter((b) => b.end_at >= now && b.status !== "CANCELLED");
  const upcomingCount = upcomingBookings.length;
  const confirmedCount = rawBookings.filter((b) => b.status === "CONFIRMED").length;

  const nextUpcoming = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Customer Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{session.user.email}</span>
            </p>
          </div>

          <Link href="/businesses">
            <Button variant="primary" size="sm" icon={<span>🔍</span>}>
              Book a New Appointment
            </Button>
          </Link>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Upcoming Appointments
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-950/60 dark:text-success-400 text-lg">
                  📅
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {upcomingCount}
                </p>
                <p className="mt-1 text-xs text-success-600 dark:text-success-400 font-medium">
                  Active scheduled reservations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Bookings Made
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 text-lg">
                  🎟️
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {totalBookings}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lifetime reservations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirmed Bookings
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-50 text-info-600 dark:bg-info-950/60 dark:text-info-400 text-lg">
                  ✓
                </span>
              </div>
              <div className="mt-4">
                <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {confirmedCount}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Confirmed status
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner: Book a New Appointment */}
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-indigo-50/50 p-6 shadow-sm dark:border-brand-900 dark:from-brand-950/40 dark:to-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Need another service?</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse local providers, select services, and pick your preferred time slot in real time.
            </p>
          </div>
          <Link href="/businesses" className="shrink-0">
            <Button variant="primary" size="md">
              Explore Available Businesses →
            </Button>
          </Link>
        </div>

        {/* Next Upcoming Booking Feature Card */}
        {nextUpcoming && (
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
              Next Scheduled Appointment
            </h2>
            <Card hoverable className="p-6 border-l-4 border-l-brand-600 dark:border-l-brand-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${nextUpcoming.business.slug}`}
                      className="font-heading font-extrabold text-lg text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                    >
                      {nextUpcoming.business.name}
                    </Link>
                    <Badge status={nextUpcoming.status as any} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {nextUpcoming.service.name} ({nextUpcoming.service.duration_minutes} min)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>🕒</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(nextUpcoming.start_at, nextUpcoming.business.timezone)}
                    </span>
                  </p>
                  {nextUpcoming.business.address && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1">
                      <span>📍</span>
                      <span>{nextUpcoming.business.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <Link href="/customer/bookings">
                    <Button variant="outline" size="sm">
                      Manage All Bookings →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Link Card to All Bookings */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/customer/bookings" className="w-full">
            <Card hoverable className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                    View Complete Booking History
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Access upcoming reservations, past appointments, and cancellation options.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Go to My Bookings →
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
