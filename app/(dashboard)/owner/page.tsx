import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Scissors,
  Calendar,
  Ticket,
  TrendingUp,
  CreditCard,
  BarChart3,
  Clock,
  MapPin,
  Pencil,
  Plus,
  LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Owner Dashboard — Slotly",
  description: "Manage your business, services, availability schedule, and customer reservations.",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

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

interface OwnerDashboardPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function OwnerDashboardPage({ searchParams }: OwnerDashboardPageProps) {
  const { error } = (await searchParams) || {};
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
    include: {
      _count: {
        select: {
          services: true,
          availabilities: true,
          availabilityExceptions: true,
        },
      },
    },
  });

  const allBookings = business
    ? await db.booking.findMany({
        where: { business_id: business.id },
        include: {
          service: {
            select: { name: true, price: true, duration_minutes: true },
          },
          customer: {
            select: { name: true, email: true },
          },
        },
        orderBy: { start_at: "desc" },
      })
    : [];

  const now = new Date();
  const totalBookings = allBookings.length;
  const upcomingBookings = allBookings.filter((b) => b.end_at >= now && b.status !== "CANCELLED").length;

  const totalRevenue = allBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const recentBookings = allBookings.slice(0, 5);

  const navCards: Array<{
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge: string;
    badgeVariant: BadgeVariant;
  }> = [
    {
      title: "Business Settings",
      description: "Manage business name, description, address, photos, and location coordinates.",
      href: business ? "/owner/business/edit" : "/owner/business/new",
      icon: Building2,
      badge: business ? "Configured" : "Action Needed",
      badgeVariant: business ? "success" : "warning",
    },
    {
      title: "Services",
      description: "Define appointment offerings with duration, prices, and buffer times.",
      href: "/owner/services",
      icon: Scissors,
      badge: business ? `${business._count.services} active` : "0 active",
      badgeVariant: "brand",
    },
    {
      title: "Availability Schedule",
      description: "Set recurring weekly operating hours and date-specific holiday exceptions.",
      href: "/owner/availability",
      icon: Calendar,
      badge: business
        ? `${business._count.availabilities} days / ${business._count.availabilityExceptions} exceptions`
        : "Not set",
      badgeVariant: "info",
    },
    {
      title: "Customer Bookings",
      description: "View, confirm, filter, and manage all incoming client appointment reservations.",
      href: "/owner/bookings",
      icon: Ticket,
      badge: `${upcomingBookings} upcoming`,
      badgeVariant: "success",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {error === "owner_booking_disabled" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 text-amber-200 flex items-center gap-3 backdrop-blur-xl shadow-md">
          <span className="text-xl">⚠️</span>
          <p className="text-xs sm:text-sm leading-relaxed">
            <strong>Access Restricted:</strong> Business owners cannot book client appointments or access customer directory pages. You have been redirected to your Owner Dashboard.
          </p>
        </div>
      )}

        {/* Dashboard Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 sm:p-8 shadow-[0_12px_48px_rgba(139,92,246,0.12)] backdrop-blur-xl">
          <div className="space-y-1">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="font-semibold text-brand-300">{session.user.email}</span> • Here is what is happening with your business today.
            </p>
          </div>

          {business ? (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={`/${business.slug}`} target="_blank">
                <button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-heading font-extrabold text-xs px-4 py-2.5 transition-all">
                  View Public Page ↗
                </button>
              </Link>
              <Link href="/owner/business/edit">
                <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-4 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </Link>
            </div>
          ) : (
            <Link href="/owner/business/new">
              <button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-heading font-extrabold text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(160,120,255,0.3)] transition-all flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Business Profile</span>
              </button>
            </Link>
          )}
        </div>

        {/* Business Header Banner if business exists */}
        {business && (
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-slate-100 text-base sm:text-lg">
                  {business.name}
                </span>
                <span className="ml-2 text-xs font-bold text-brand-300">
                  /{business.slug}
                </span>
                {business.address && (
                  <p className="text-xs text-slate-300 truncate max-w-md mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{business.address}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Operating Timezone: <strong className="text-slate-200">{business.timezone}</strong>
            </div>
          </div>
        )}

        {/* Summary Bento Grid Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card 1: Total Revenue */}
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -right-4 -top-4 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Revenue
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#273647] text-brand-400 border border-white/5">
                <CreditCard className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 z-10">
              <p className="font-heading text-3xl font-extrabold text-slate-100">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-brand-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Sum of confirmed booking payments</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute -right-4 -top-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Bookings
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#273647] text-indigo-400 border border-white/5">
                <BarChart3 className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 z-10">
              <p className="font-heading text-3xl font-extrabold text-slate-100">
                {totalBookings}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Lifetime client reservations
              </p>
            </div>
          </div>

          {/* Card 3: Upcoming Today / Active */}
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-6 shadow-md relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-brand-500/10 rounded-tl-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Upcoming Appointments
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Calendar className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 z-10">
              <p className="font-heading text-3xl font-extrabold text-white">
                {upcomingBookings}
              </p>
              <p className="mt-1 text-xs text-brand-300 font-semibold">
                Active scheduled reservations
              </p>
            </div>
          </div>
        </div>

        {/* Business Management Navigation Cards */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-extrabold text-slate-100">
            Business Management
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {navCards.map((item) => {
              const CardIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#161b22] p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-brand-300 group-hover:bg-brand-500/20 transition-colors">
                        <CardIcon className="h-5 w-5" />
                      </span>
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-slate-100 text-base group-hover:text-brand-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <Link href={item.href} className="block">
                      <button className="w-full rounded-full bg-white/5 border border-white/10 hover:bg-brand-500 hover:text-white text-slate-300 font-extrabold text-xs py-2 px-3 transition-all flex items-center justify-between">
                        <span>Manage</span>
                        <span>→</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings Preview List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>Recent Bookings</span>
              <span className="rounded-full bg-[#273647] px-2.5 py-0.5 text-xs font-bold text-slate-300 border border-white/5">
                {recentBookings.length}
              </span>
            </h2>
            <Link href="/owner/bookings">
              <button className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors">
                View All Bookings →
              </button>
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#161b22] shadow-md overflow-hidden divide-y divide-white/10">
              {recentBookings.map((b) => {
                const statusColor =
                  b.status === "CONFIRMED"
                    ? "bg-[#10B981]"
                    : b.status === "CANCELLED"
                    ? "bg-slate-600"
                    : "bg-brand-400";

                return (
                  <div
                    key={b.id}
                    className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-3 hover:bg-[#273647]/40 transition-colors pl-6"
                  >
                    {/* Status Accent Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`} />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm sm:text-base text-slate-100">
                          {b.service?.name || "Service"}
                        </span>
                        <Badge status={b.status as any} size="sm" />
                      </div>
                      <p className="text-xs text-slate-300">
                        Customer: <span className="font-semibold text-slate-100">{b.customer?.name || b.customer?.email}</span> ({b.customer?.email})
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(b.start_at, business?.timezone)}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-heading font-extrabold text-base text-brand-400">
                        {formatCurrency(b.service?.price || 0)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {b.service?.duration_minutes} min duration
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#161b22]/50 p-8 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                No customer bookings recorded yet. Share your business page URL to start accepting reservations!
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
