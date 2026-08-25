import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Ticket,
  CheckCircle,
  Clock,
  MapPin,
  ClipboardList,
  Plus,
} from "lucide-react";

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
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#051424] text-slate-100 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Consumer Ambient Mesh Glow Background (Stitch Design) */}
      <div className="pointer-events-none absolute -top-36 left-0 h-[600px] w-[700px] rounded-full bg-sky-400/10 blur-[140px] animate-glow-float" />
      <div className="pointer-events-none absolute -bottom-36 -right-20 h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[140px] animate-glow-float-alt" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.12)] backdrop-blur-xl">
          <div className="space-y-1">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
              Customer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="font-semibold text-brand-300">{session.user.email}</span> • Manage your appointment reservations in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/customer/bookings">
              <button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs px-4 py-2.5 transition-all">
                View My Bookings
              </button>
            </Link>
            <Link href="/businesses">
              <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Book New</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card 1: Upcoming Appointments */}
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Upcoming Appointments
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Calendar className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-extrabold text-slate-100">
                {upcomingCount}
              </p>
              <p className="mt-1 text-xs text-brand-300 font-semibold">
                Active scheduled reservations
              </p>
            </div>
          </div>

          {/* Card 2: Total Bookings Made */}
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Bookings Made
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#273647] text-indigo-400 border border-white/5">
                <Ticket className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-extrabold text-slate-100">
                {totalBookings}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Lifetime reservations
              </p>
            </div>
          </div>

          {/* Card 3: Confirmed Bookings */}
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Confirmed Bookings
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                <CheckCircle className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-extrabold text-slate-100">
                {confirmedCount}
              </p>
              <p className="mt-1 text-xs text-[#10B981] font-semibold">
                Confirmed status
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner: Book a New Appointment */}
        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-slate-900 p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <span>Need another service?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse local providers, select services, and pick your preferred time slot in real time.
            </p>
          </div>
          <Link href="/businesses" className="shrink-0">
            <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all">
              Explore Available Businesses →
            </button>
          </Link>
        </div>

        {/* Next Upcoming Booking Feature Card */}
        {nextUpcoming && (
          <div className="space-y-3">
            <h2 className="font-heading text-xl font-extrabold text-slate-100">
              Next Scheduled Appointment
            </h2>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] border-l-4 border-l-brand-400 p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${nextUpcoming.business.slug}`}
                      className="font-heading font-extrabold text-lg text-slate-100 hover:text-brand-300 transition-colors"
                    >
                      {nextUpcoming.business.name}
                    </Link>
                    <Badge status={nextUpcoming.status as any} />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    {nextUpcoming.service.name} ({nextUpcoming.service.duration_minutes} min)
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-200">
                      {formatDate(nextUpcoming.start_at, nextUpcoming.business.timezone)}
                    </span>
                  </p>
                  {nextUpcoming.business.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{nextUpcoming.business.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <Link href="/customer/bookings">
                    <button className="rounded-full bg-white/5 border border-white/10 hover:bg-brand-500 hover:text-white text-slate-300 font-extrabold text-xs py-2 px-4 transition-all">
                      Manage All Bookings →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Link Card to All Bookings */}
        <div className="pt-2">
          <Link href="/customer/bookings" className="block">
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5 shadow-md hover:border-brand-500/40 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 shrink-0">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-slate-100 text-base">
                    View Complete Booking History
                  </h3>
                  <p className="text-xs text-slate-400">
                    Access upcoming reservations, past appointments, and cancellation options.
                  </p>
                </div>
              </div>
              <button className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors shrink-0">
                Go to My Bookings →
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
