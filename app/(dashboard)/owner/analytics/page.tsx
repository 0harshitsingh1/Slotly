import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import AnalyticsCharts, { DailyDataPoint } from "./AnalyticsCharts";

export const metadata = {
  title: "Analytics & Performance — Owner Dashboard",
  description: "View booking trends, monthly revenue, and business analytics.",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OwnerAnalyticsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
  });

  if (!business) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-8 text-center shadow-md backdrop-blur-xl space-y-4">
          <span className="text-4xl block">🏬</span>
          <h1 className="font-heading text-2xl font-extrabold text-slate-100">
            No Business Profile Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Please register your business profile first to access analytics and booking statistics.
          </p>
          <div className="pt-2">
            <Link href="/owner/business/new">
              <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-6 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all">
                + Create Business Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 30 days ago starting at 00:00:00
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all CONFIRMED bookings for this business
  const confirmedBookings = await db.booking.findMany({
    where: {
      business_id: business.id,
      status: "CONFIRMED",
    },
    include: {
      service: {
        select: { price: true },
      },
    },
    orderBy: { start_at: "asc" },
  });

  // Calculate metrics for current month
  const thisMonthBookings = confirmedBookings.filter(
    (b) => new Date(b.start_at) >= startOfCurrentMonth
  );
  const totalBookingsThisMonth = thisMonthBookings.length;
  const totalRevenueThisMonth = thisMonthBookings.reduce(
    (sum, b) => sum + (b.service?.price || 0),
    0
  );

  // 30-day range calculations
  const last30DaysConfirmed = confirmedBookings.filter(
    (b) => new Date(b.start_at) >= thirtyDaysAgo
  );
  const avgBookingsPerDay = (last30DaysConfirmed.length / 30).toFixed(1);

  // Map 30 days of data for the chart
  const dailyDataMap = new Map<string, { bookings: number; revenue: number }>();

  // Initialize all 30 days with 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyDataMap.set(key, { bookings: 0, revenue: 0 });
  }

  // Populate bookings into dailyDataMap
  last30DaysConfirmed.forEach((b) => {
    try {
      const dateKey = new Date(b.start_at).toISOString().split("T")[0];
      if (dailyDataMap.has(dateKey)) {
        const current = dailyDataMap.get(dateKey)!;
        current.bookings += 1;
        current.revenue += b.service?.price || 0;
      }
    } catch {
      // Ignore invalid date parsing
    }
  });

  // Format array for recharts
  const chartData: DailyDataPoint[] = Array.from(dailyDataMap.entries()).map(
    ([dateStr, val]) => {
      const dateObj = new Date(`${dateStr}T12:00:00Z`);
      const label = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: business.timezone,
      }).format(dateObj);

      const fullLabel = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: business.timezone,
      }).format(dateObj);

      return {
        date: label,
        fullDate: fullLabel,
        bookings: val.bookings,
        revenue: val.revenue,
      };
    }
  );

  const hasAnyBookings = confirmedBookings.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.12)] backdrop-blur-xl">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
            Analytics &amp; Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track daily booking trends, monthly revenue, and client conversion for <strong className="text-brand-300">{business.name}</strong>.
          </p>
        </div>

        <Link href="/owner/bookings">
          <button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs px-4 py-2.5 transition-all">
            View All Reservations →
          </button>
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1: Total Bookings This Month */}
        <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bookings This Month
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 text-lg border border-brand-500/30">
              🎟️
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-3xl font-extrabold text-slate-100">
              {totalBookingsThisMonth}
            </p>
            <p className="mt-1 text-xs text-brand-300 font-semibold">
              Confirmed client reservations this month
            </p>
          </div>
        </div>

        {/* Card 2: Total Revenue This Month */}
        <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Revenue This Month
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg border border-emerald-500/30">
              💳
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-3xl font-extrabold text-slate-100">
              {formatCurrency(totalRevenueThisMonth)}
            </p>
            <p className="mt-1 text-xs text-emerald-400 font-semibold">
              Confirmed booking revenue in ₹
            </p>
          </div>
        </div>

        {/* Card 3: Avg Bookings Per Day */}
        <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Avg Bookings / Day
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#273647] text-indigo-400 text-lg border border-white/5">
              📈
            </span>
          </div>
          <div className="mt-4">
            <p className="font-heading text-3xl font-extrabold text-slate-100">
              {avgBookingsPerDay}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Daily average over the last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-heading text-lg font-extrabold text-slate-100">
              Daily Booking Trends (Last 30 Days)
            </h2>
            <p className="text-xs text-slate-400">
              Confirmed customer appointments per day
            </p>
          </div>
          <span className="text-xs font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">
            30-Day Window
          </span>
        </div>

        {hasAnyBookings ? (
          <AnalyticsCharts data={chartData} />
        ) : (
          /* Graceful Empty State */
          <div className="rounded-xl border border-dashed border-white/10 bg-[#122131]/50 p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#273647] text-2xl text-slate-400 border border-white/5">
              📊
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-slate-200 text-base">
                No Confirmed Bookings Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once customers make confirmed reservations, your daily booking trends and revenue analytics will automatically populate here.
              </p>
            </div>
            <div className="pt-2">
              <Link href={`/${business.slug}`} target="_blank">
                <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all">
                  View Public Booking Page ↗
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
